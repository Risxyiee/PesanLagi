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
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    // 1. Find store by slug
    const { data: store, error: storeErr } = await admin
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 2. Get categories for this store
    const { data: categories } = await admin
      .from("categories")
      .select("*")
      .eq("store_id", store.id)
      .order("name", { ascending: true });

    // 3. Get available menus joined with category name
    const { data: menus } = await admin
      .from("menus")
      .select("*, categories(name)")
      .eq("store_id", store.id)
      .eq("is_available", true)
      .order("name", { ascending: true });

    // Flatten category name
    const flatMenus = (menus || []).map((m: any) => ({
      ...m,
      category_name: m.categories?.name || null,
      categories: undefined,
    }));

    return NextResponse.json({ store, categories: categories || [], menus: flatMenus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
