import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const res = NextResponse.redirect(`${appUrl}/?auth=success`);
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/api/auth/callback`,
      },
    });

    if (error) {
      console.error("Google OAuth error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.redirect(data.url!);
  } catch (err: any) {
    console.error("Google OAuth error:", err.message);
    return NextResponse.json(
      { error: "Gagal memulai Google OAuth" },
      { status: 500 }
    );
  }
}
