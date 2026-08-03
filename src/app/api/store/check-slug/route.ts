import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ exists: false });

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    const { data } = await admin
      .from("stores")
      .select("id, slug")
      .eq("slug", slug.trim())
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
