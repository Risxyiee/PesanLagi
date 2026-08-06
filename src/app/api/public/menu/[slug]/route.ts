import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    // 1. Find store by slug — keep id for internal queries only
    const { data: rawStore, error: storeErr } = await admin
      .from("stores")
      .select("id, name, slug, description, logo_url, whatsapp, address, bg_color, qr_color, hours, is_open")
      .eq("slug", slug)
      .single();

    if (storeErr || !rawStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const storeId = rawStore.id;
    const { id: _id, ...store } = rawStore;

    // 2. Get categories for this store
    const { data: categories } = await admin
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .order("name", { ascending: true });

    // 3. Get available menus joined with category name
    const { data: menus } = await admin
      .from("menus")
      .select("*, categories(name)")
      .eq("store_id", storeId)
      .eq("is_available", true)
      .order("name", { ascending: true });

    // Flatten category name
    const flatMenus = (menus || []).map((m: Record<string, unknown>) => ({
      ...m,
      category_name: (m.categories as Record<string, string>)?.name || null,
      categories: undefined,
    }));

    return NextResponse.json({ store, categories: categories || [], menus: flatMenus });
  } catch (err: unknown) {
    console.error("Public menu error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
