import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, withCookies, getStoreId } from "@/lib/auth-helper";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const storeId = await getStoreId(user.id);
    if (!storeId)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const { source_id, target_id } = await req.json();
    if (!source_id || !target_id) {
      return NextResponse.json(
        { error: "source_id and target_id required" },
        { status: 400 }
      );
    }

    // Get sort_order of target menu
    const { data: targetMenu } = await admin
      .from("menus")
      .select("sort_order")
      .eq("id", target_id)
      .eq("store_id", storeId)
      .single();

    if (!targetMenu) {
      return NextResponse.json(
        { error: "Target menu not found" },
        { status: 404 }
      );
    }

    const targetOrder = targetMenu.sort_order || 0;

    // Get max sort_order
    const { data: maxRow } = await admin
      .from("menus")
      .select("sort_order")
      .eq("store_id", storeId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxRow?.sort_order || 0) + 1;

    // Move source to a temp high position
    await admin
      .from("menus")
      .update({ sort_order: nextOrder })
      .eq("id", source_id)
      .eq("store_id", storeId);

    // Shift everything >= target up by 1 (except the source)
    const { data: menusAboveTarget } = await admin
      .from("menus")
      .select("id, sort_order")
      .eq("store_id", storeId)
      .gte("sort_order", targetOrder)
      .neq("id", source_id)
      .order("sort_order", { ascending: true });

    for (const menu of menusAboveTarget || []) {
      await admin
        .from("menus")
        .update({ sort_order: menu.sort_order + 1 })
        .eq("id", menu.id);
    }

    // Place source at target's position
    await admin
      .from("menus")
      .update({ sort_order: targetOrder })
      .eq("id", source_id)
      .eq("store_id", storeId);

    return withCookies(res, { success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
