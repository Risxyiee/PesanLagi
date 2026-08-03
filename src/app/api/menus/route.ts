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

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");

    let query = createSupabaseAdminClient()
      .from("menus")
      .select("*, categories(name)")
      .eq("store_id", storeId);

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Flatten category name
    const menus = (data || []).map((m: any) => ({
      ...m,
      category_name: m.categories?.name || null,
      categories: undefined,
    }));

    return NextResponse.json(menus);
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

    const body = await req.json();
    const { id, name, description, price, category_id, image_url, is_available } =
      body;

    if (!name?.trim())
      return NextResponse.json(
        { error: "Nama menu wajib diisi" },
        { status: 400 }
      );
    if (price == null || price < 0)
      return NextResponse.json(
        { error: "Harga tidak valid" },
        { status: 400 }
      );

    const admin = createSupabaseAdminClient();

    let result;
    if (id) {
      // Update
      const { data, error } = await admin
        .from("menus")
        .update({
          name: name.trim(),
          description: description || null,
          price: Number(price),
          category_id: category_id || null,
          image_url: image_url || null,
          is_available: is_available !== false,
        })
        .eq("id", id)
        .eq("store_id", storeId)
        .select()
        .single();

      result = { data, error };
    } else {
      // Create
      const { data, error } = await admin
        .from("menus")
        .insert({
          store_id: storeId,
          name: name.trim(),
          description: description || null,
          price: Number(price),
          category_id: category_id || null,
          image_url: image_url || null,
          is_available: is_available !== false,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json(result.data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await getStoreId(user.id);
    const { id } = await req.json();

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("menus")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
