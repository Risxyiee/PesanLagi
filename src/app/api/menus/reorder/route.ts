import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

async function getAuthUser(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function getStoreId(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("stores")
    .select("id")
    .eq("user_id", userId)
    .single();
  return data?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const admin = createSupabaseAdminClient();

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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
