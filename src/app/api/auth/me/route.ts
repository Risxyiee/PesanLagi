import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Get profile data (is_pro, etc.)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_pro, pro_expiry_date")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
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
