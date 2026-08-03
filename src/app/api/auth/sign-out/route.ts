import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ success: true });
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    await supabase.auth.signOut();
    return res;
  } catch {
    return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
  }
}
