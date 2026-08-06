import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, withCookies, getStoreId } from "@/lib/auth-helper";

export async function GET() {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const { data, error } = await admin
      .from("stores")
      .select(
        "id, user_id, name, slug, logo_url, bg_color, qr_color, description, whatsapp, address, maps_url, hours, is_open, created_at"
      )
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Store fetch error:", error.message);
    }

    return withCookies(res, data || null);
  } catch (err: unknown) {
    console.error("Store GET unexpected:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await authenticateRequest();
    if ("error" in auth) return auth.error;
    const { user, res, admin } = auth;

    const body = await req.json();
    const allowed = [
      "name",
      "slug",
      "category",
      "logo_url",
      "bg_color",
      "qr_color",
      "description",
      "whatsapp",
      "address",
      "maps_url",
      "hours",
      "is_open",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await admin
      .from("stores")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Store PUT error:", error);
      return NextResponse.json({ error: "Gagal menyimpan pengaturan toko" }, { status: 500 });
    }

    return withCookies(res, data);
  } catch (err: unknown) {
    console.error("Store PUT unexpected:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
