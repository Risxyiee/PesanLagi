import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { rateLimitCheckSlug } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const limited = rateLimitCheckSlug(req);
  if (limited) return limited;

  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const excludeId = req.nextUrl.searchParams.get("exclude_id");
    if (!slug) return NextResponse.json({ available: true });

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    let query = admin
      .from("stores")
      .select("id, slug")
      .eq("slug", slug.trim());

    // Exclude the user's own store so they can keep their current slug
    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();

    if (!data) {
      return NextResponse.json({ available: true });
    }

    return NextResponse.json({ available: false });
  } catch (err: unknown) {
    console.error("Check slug error:", err);
    return NextResponse.json({ error: "Gagal mengecek ketersediaan slug" }, { status: 500 });
  }
}
