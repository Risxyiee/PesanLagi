import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

async function getAuthUser(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    const { data, error } = await admin
      .from("stores")
      .select(
        "id, user_id, name, slug, logo_url, bg_color, qr_color, description, whatsapp, address, maps_url, hours, created_at"
      )
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found (single() returned no rows)
      console.error("Store fetch error:", error.message);
    }

    return NextResponse.json(data || null);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const allowed = [
      "name",
      "slug",
      "logo_url",
      "bg_color",
      "qr_color",
      "description",
      "whatsapp",
      "address",
      "maps_url",
      "hours",
    ];

    const updateData: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }
    const { data, error } = await admin
      .from("stores")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
