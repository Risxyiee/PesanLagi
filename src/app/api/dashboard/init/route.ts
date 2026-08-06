import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const res = NextResponse.json({});
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

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

    // Fetch store, profile, menus, categories in parallel
    const [storeResult, profileResult, menusResult, catsResult] = await Promise.all([
      admin
        .from("stores")
        .select(
          "id, user_id, name, slug, logo_url, bg_color, qr_color, description, whatsapp, address, maps_url, hours, is_open, created_at"
        )
        .eq("user_id", user.id)
        .single(),
      admin
        .from("profiles")
        .select("is_pro, pro_expiry_date")
        .eq("id", user.id)
        .single(),
      admin
        .from("menus")
        .select("*, categories(name)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      admin
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

    // Get store id, fallback to user.id if no store (shouldn't happen normally)
    const storeId = storeResult.data?.id;

    // Filter menus/categories by store_id (CRITICAL FIX: was using user.id before)
    const menus = (menusResult.data || []).filter((m: any) => m.store_id === storeId).map((m: any) => ({
      ...m,
      category_name: m.categories?.name || null,
      categories: undefined,
    }));
    const categories = (catsResult.data || []).filter((c: any) => c.store_id === storeId);

    // Build response body
    const body = {
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        is_pro: profileResult.data?.is_pro ?? false,
        pro_expiry_date: profileResult.data?.pro_expiry_date ?? null,
      },
      store: storeResult.data || null,
      menus,
      categories,
    };

    // Return with refreshed cookies
    return new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Merge cookies from the supabase client refresh
        ...Object.fromEntries(res.cookies.getAll().map(c => [`set-cookie`, c.toString()])),
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err && (err as any).status === 409) {
      return NextResponse.json({ error: "Session refresh conflict, please retry" }, { status: 409 });
    }
    console.error("Dashboard init error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
