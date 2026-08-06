import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, withCookies, getStoreId } from "@/lib/auth-helper";

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const storeId = await getStoreId(user.id);
    if (!storeId) return withCookies(res, []);

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");

    let query = admin
      .from("menus")
      .select("*, categories(name)")
      .eq("store_id", storeId);

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }
    if (search) {
      // Sanitize search to prevent PostgREST filter injection
      const safeSearch = search.replace(/[%_,.()\\]/g, '');
      if (safeSearch) {
        query = query.or(`name.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`);
      }
    }

    const { data, error } = await query
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Menus GET error:", error);
      return NextResponse.json({ error: "Gagal memuat menu" }, { status: 500 });
    }

    // Flatten category name
    const menus = (data || []).map((m: Record<string, unknown>) => ({
      ...m,
      category_name: (m.categories as Record<string, string>)?.name || null,
      categories: undefined,
    }));

    return withCookies(res, menus);
  } catch (err: unknown) {
    console.error("Menus GET unexpected:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
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

    const body = await req.json();
    const { id, name, description, price, category_id, image_url, is_available } = body;

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

    let result;
    if (id) {
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

    if (result.error) {
      console.error("Menus POST error:", result.error);
      return NextResponse.json({ error: "Gagal menyimpan menu" }, { status: 500 });
    }
    return withCookies(res, result.data);
  } catch (err: unknown) {
    console.error("Menus POST unexpected:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const storeId = await getStoreId(user.id);
    if (!storeId)
      return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Menu ID required" }, { status: 400 });
    }

    // Build update from only the provided fields
    const allowedPatch = ["name", "description", "price", "category_id", "image_url", "is_available"];
    const updateData: Record<string, unknown> = {};
    for (const key of allowedPatch) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await admin
      .from("menus")
      .update(updateData)
      .eq("id", id)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) {
      console.error("Menus PATCH error:", error);
      return NextResponse.json({ error: "Gagal mengupdate menu" }, { status: 500 });
    }
    return withCookies(res, data);
  } catch (err: unknown) {
    console.error("Menus PATCH unexpected:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const storeId = await getStoreId(user.id);
    if (!storeId) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Menu ID required" }, { status: 400 });
    }

    const { error } = await admin
      .from("menus")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (error) {
      console.error("Menus DELETE error:", error);
      return NextResponse.json({ error: "Gagal menghapus menu" }, { status: 500 });
    }
    return withCookies(res, { success: true });
  } catch (err: unknown) {
    console.error("Menus DELETE unexpected:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
