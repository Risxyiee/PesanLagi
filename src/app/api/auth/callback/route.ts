import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (errorParam) {
    const errorMsg = searchParams.get("error_description") || errorParam;
    return NextResponse.redirect(
      `${appUrl}/?auth=error&error=${encodeURIComponent(errorMsg)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/?auth=error&error=No code provided`);
  }

  try {
    const res = NextResponse.redirect(`${appUrl}/?auth=success`);
    const supabase = await createSupabaseServerClient(res);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      return NextResponse.redirect(
        `${appUrl}/?auth=error&error=${encodeURIComponent(error?.message || "Gagal menukar kode OAuth")}`
      );
    }

    const userId = data.user.id;
    const email = data.user.email;

    // Ensure the user has a store (create one if not)
    if (email) {
      const admin = createSupabaseAdminClient();
      const { data: existingStore } = await admin
        .from("stores")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingStore) {
        const storeName = email.split("@")[0];
        let slug = storeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

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

    return res;
  } catch (err: any) {
    console.error("OAuth callback error:", err.message);
    return NextResponse.redirect(
      `${appUrl}/?auth=error&error=${encodeURIComponent("Terjadi kesalahan saat login Google")}`
    );
  }
}
