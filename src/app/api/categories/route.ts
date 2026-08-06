import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, withCookies, getStoreId } from "@/lib/auth-helper";

export async function GET() {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const storeId = await getStoreId(user.id);
    if (!storeId) return withCookies(res, []);

    const { data, error } = await admin
      .from("categories")
      .select("*")
      .eq("store_id", storeId)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return withCookies(res, data || []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const storeId = await getStoreId(user.id);
    if (!storeId)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const { name } = await req.json();
    if (!name?.trim())
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );

    const { data, error } = await admin
      .from("categories")
      .insert({ store_id: storeId, name: name.trim() })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return withCookies(res, data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const storeId = await getStoreId(user.id);
    if (!storeId)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

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
    return withCookies(res, { success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
