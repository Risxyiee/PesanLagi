import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { withCookies } from "@/lib/auth-helper";

export async function GET() {
  try {
    const res = NextResponse.json({});
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, is_pro, pro_expiry_date")
      .eq("id", user.id)
      .single();

    return withCookies(res, {
      user: {
        id: user.id,
        email: user.email,
        is_pro: profile?.is_pro ?? false,
        pro_expiry_date: profile?.pro_expiry_date ?? null,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
