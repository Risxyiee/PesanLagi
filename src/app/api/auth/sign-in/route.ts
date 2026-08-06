import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { withCookies } from "@/lib/auth-helper";

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

    const userEmail = data.user.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Akun tidak memiliki email" }, { status: 400 });
    }

    // Get profile
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("is_pro, pro_expiry_date")
      .eq("id", data.user.id)
      .single();

    // Ensure the user has a store (create one if not)
    await ensureStore(admin, data.user.id, userEmail);

    // Return with session cookies (C2 FIX: was returning new NextResponse, discarding cookies)
    return withCookies(res, {
      user: {
        id: data.user.id,
        email: userEmail,
        is_pro: profile?.is_pro ?? false,
      },
    });
  } catch (err: unknown) {
    console.error("Sign-in error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function ensureStore(
  admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
  email: string
) {
  const { data: existing } = await admin
    .from("stores")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const storeName = email.split("@")[0];
    let slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Ensure slug is unique
    const { data: dup } = await admin
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (dup) {
      let suffix = 2;
      while (true) {
        const candidate = `${slug}-${suffix}`;
        const { data: d } = await admin
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

    await admin.from("stores").insert({ user_id: userId, name: storeName, slug });
  }
}
