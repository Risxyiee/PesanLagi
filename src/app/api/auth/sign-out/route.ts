import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Robust sign-out: invalidate session on Supabase + force-clear all auth cookies.
 * This prevents stale sessions from auto-redirecting back to dashboard.
 */
export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    // 1. Invalidate session on Supabase server
    try {
      await supabase.auth.signOut();
    } catch {
      // Continue even if Supabase signOut fails (e.g. already signed out)
    }

    // 2. Force-clear ALL Supabase auth cookies regardless of what signOut did.
    //    This ensures the browser discards sb-access-token and sb-refresh-token.
    const cookieNames = req.cookies.getAll().map(c => c.name);
    for (const name of cookieNames) {
      if (name.startsWith('sb-') || name.includes('supabase')) {
        res.cookies.set(name, '', {
          path: '/',
          maxAge: 0,
          sameSite: 'lax',
        });
      }
    }

    return res;
  } catch {
    return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
  }
}
