import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ success: true });
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, pro_expiry_date")
      .eq("id", data.user.id)
      .single();

    // Ensure the user has a store (create one if not)
    await ensureStore(supabase, data.user.id, data.user.email!);

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        is_pro: profile?.is_pro ?? false,
      },
    });
  } catch (err) {
    console.error("Sign-in error:", String(err));
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function ensureStore(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  email: string
) {
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const storeName = email.split("@")[0];
    let slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Ensure slug is unique
    const { data: dup } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (dup) {
      let suffix = 2;
      while (true) {
        const candidate = `${slug}-${suffix}`;
        const { data: d } = await supabase
          .from("stores")
          .select("id")
          .eq("slug", candidate)
          .maybeSingle();
        if (!d) {
          slug = candidate;
          break;
        }
        suffix++;
      }
    }

    await supabase.from("stores").insert({ user_id: userId, name: storeName, slug });
  }
}
