import { NextResponse } from "next/server";
import { authenticateRequest, withCookies } from "@/lib/auth-helper";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export async function GET() {
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

    const [usersRes, storesRes, menusRes, catsRes, profilesRes] = await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("stores").select("id", { count: "exact", head: true }),
      admin.from("menus").select("id", { count: "exact", head: true }),
      admin.from("categories").select("id", { count: "exact", head: true }),
      admin.from("profiles").select("id").eq("is_pro", true),
    ]);

    return withCookies(res, {
      total_users: usersRes.count ?? 0,
      total_stores: storesRes.count ?? 0,
      total_menus: menusRes.count ?? 0,
      total_categories: catsRes.count ?? 0,
      total_pro_users: profilesRes.data?.length ?? 0,
    });
  } catch (err: unknown) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
