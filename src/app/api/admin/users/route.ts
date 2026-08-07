import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, withCookies } from "@/lib/auth-helper";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res } = auth;

    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const offset = (page - 1) * pageSize;

    // Get all profiles with their stores and menu/category counts
    let profilesQuery = admin
      .from("profiles")
      .select("id, is_pro, pro_expiry_date, created_at")
      .order("created_at", { ascending: false });

    const { data: profiles, count: totalProfiles } = await profilesQuery;

    // Get all stores to join
    const { data: stores } = await admin
      .from("stores")
      .select("id, user_id, name, slug, is_open, created_at")
      .order("created_at", { ascending: false });

    // Get menu & category counts per store
    const storeIds = (stores || []).map((s: { id: string }) => s.id);
    let menuCounts: Record<string, number> = {};
    let catCounts: Record<string, number> = {};

    if (storeIds.length > 0) {
      const [menusRes, catsRes] = await Promise.all([
        admin.from("menus").select("store_id").in("store_id", storeIds),
        admin.from("categories").select("store_id").in("store_id", storeIds),
      ]);
      for (const m of menusRes.data || []) {
        const sid = (m as { store_id: string }).store_id;
        menuCounts[sid] = (menuCounts[sid] || 0) + 1;
      }
      for (const c of catsRes.data || []) {
        const sid = (c as { store_id: string }).store_id;
        catCounts[sid] = (catCounts[sid] || 0) + 1;
      }
    }

    // Get auth users for emails
    // Note: We can't query auth.users from admin client, so we'll use the profile id
    // The email will be derived from the store or profile data

    // Build store map by user_id
    const storeByUser: Record<string, (typeof stores)[number]> = {};
    for (const s of stores || []) {
      storeByUser[(s as { user_id: string }).user_id] = s;
    }

    // Combine profiles + stores
    const users = (profiles || []).map((p: Record<string, unknown>) => {
      const store = storeByUser[p.id as string] as Record<string, unknown> | undefined;
      const storeId = store?.id as string | undefined;
      return {
        id: p.id,
        is_pro: p.is_pro ?? false,
        pro_expiry_date: p.pro_expiry_date ?? null,
        created_at: p.created_at,
        store_name: store?.name ?? null,
        store_slug: store?.slug ?? null,
        store_is_open: store?.is_open ?? false,
        store_id: storeId ?? null,
        menu_count: storeId ? (menuCounts[storeId] || 0) : 0,
        category_count: storeId ? (catCounts[storeId] || 0) : 0,
      };
    });

    // Filter by search if provided
    let filtered = users;
    if (search) {
      const q = search.toLowerCase();
      filtered = users.filter((u: Record<string, unknown>) =>
        ((u.store_name as string) || "").toLowerCase().includes(q) ||
        ((u.store_slug as string) || "").toLowerCase().includes(q) ||
        (u.id as string).toLowerCase().includes(q)
      );
    }

    // Paginate
    const paged = filtered.slice(offset, offset + pageSize);

    return withCookies(res, {
      users: paged,
      total: filtered.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filtered.length / pageSize),
    });
  } catch (err: unknown) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
