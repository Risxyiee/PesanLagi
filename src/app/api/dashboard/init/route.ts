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

    // Phase 1: store + profile in parallel (profile uses user.id, not storeId)
    const [storeResult, profileResult] = await Promise.all([
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
    ]);

    const storeId = storeResult.data?.id;

    // Phase 2: menus + categories scoped by store_id at the DB level
    let menus: Record<string, unknown>[] = [];
    let categories: Record<string, unknown>[] = [];

    if (storeId) {
      const [menusResult, catsResult] = await Promise.all([
        admin
          .from("menus")
          .select("*, categories(name)")
          .eq("store_id", storeId)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        admin
          .from("categories")
          .select("*")
          .eq("store_id", storeId)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),
      ]);

      menus = (menusResult.data || []).map((m: Record<string, unknown>) => ({
        ...m,
        category_name: (m.categories as Record<string, string>)?.name || null,
        categories: undefined,
      }));
      categories = catsResult.data || [];
    }

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
    const cookieHeaders = res.cookies.getAll().map((c) => c.toString());
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    if (cookieHeaders.length > 0) {
      headers.set("set-cookie", cookieHeaders.join(", "));
    }
    return new NextResponse(JSON.stringify(body), { status: 200, headers });
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err && (err as Record<string, unknown>).status === 409) {
      return NextResponse.json({ error: "Session refresh conflict, please retry" }, { status: 409 });
    }
    console.error("Dashboard init error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
