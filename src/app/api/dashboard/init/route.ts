import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    // Single getUser call — avoids AuthRefreshDiscardedError from concurrent clients
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    // Fetch store, menus, categories in parallel using admin client (no auth overhead)
    const [storeResult, menusResult, catsResult] = await Promise.all([
      admin
        .from("stores")
        .select(
          "id, user_id, name, slug, logo_url, bg_color, qr_color, description, whatsapp, address, maps_url, hours, is_open, created_at"
        )
        .eq("user_id", user.id)
        .single(),
      admin
        .from("menus")
        .select("*")
        .eq("store_id", user.id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      admin
        .from("categories")
        .select("*")
        .eq("store_id", user.id)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.user_metadata?.name, is_pro: user.user_metadata?.is_pro, pro_expiry_date: user.user_metadata?.pro_expiry_date },
      store: storeResult.data || null,
      menus: menusResult.data || [],
      categories: catsResult.data || [],
    });
  } catch (err: any) {
    // AuthRefreshDiscardedError is benign — session still valid from another concurrent call
    if (err?.__isAuthError && err?.status === 409) {
      return NextResponse.json({ error: "Session refresh conflict, please retry" }, { status: 409 });
    }
    console.error("Dashboard init error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
