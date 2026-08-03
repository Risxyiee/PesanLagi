import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const res = NextResponse.json({
      message: "Jika email terdaftar, link reset password telah dikirim.",
    });

    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/?auth=reset`,
    });

    return res;
  } catch {
    return NextResponse.json({
      message: "Jika email terdaftar, link reset password telah dikirim.",
    });
  }
}
