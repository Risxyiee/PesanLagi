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

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await getStoreId(user.id);
    if (!storeId) return NextResponse.json([]);

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await getStoreId(user.id);
    if (!storeId)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const { name } = await req.json();
    if (!name?.trim())
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("categories")
      .insert({ store_id: storeId, name: name.trim() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    const storeId = await getStoreId(user.id);
    if (!storeId)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const admin = createSupabaseAdminClient();

    // Nullify category_id on menus that belong to this category
    await admin
      .from("menus")
      .update({ category_id: null })
      .eq("category_id", id);

    // Delete the category
    const { error } = await admin
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
