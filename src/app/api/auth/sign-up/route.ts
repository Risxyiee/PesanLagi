import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { withCookies } from "@/lib/auth-helper";
import { rateLimitSignUp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = rateLimitSignUp(req);
  if (limited) return limited;

  // Create a response object early so Supabase can set session cookies on it
  const res = NextResponse.json({ success: true });

  try {
    const { name, email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = await createSupabaseServerClient(res);
    if (!supabase) {
      return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
    }

    // Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("already been registered")) {
        return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If email confirmation is required (no session returned)
    if (data.user && !data.session) {
      return withCookies(res, {
        requireEmailVerification: true,
        user: { id: data.user.id, email: data.user.email, is_pro: false },
      });
    }

    // Auto-confirm flow: session exists, create store
    if (data.user) {
      const admin = createSupabaseAdminClient();
      if (!admin) {
        return NextResponse.json({ error: "Supabase environment variables are not configured" }, { status: 503 });
      }
      const storeName = (name && name.trim()) || normalizedEmail.split("@")[0];
      let slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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

      await admin.from("stores").insert({ user_id: data.user.id, name: storeName, slug });
    }

    // Use withCookies to propagate session cookies from Supabase signUp
    return withCookies(res, {
      user: data.user
        ? { id: data.user.id, email: data.user.email, is_pro: false }
        : null,
    });
  } catch (err) {
    console.error("Sign-up error:", String(err));
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
