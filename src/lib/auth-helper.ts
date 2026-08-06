import { NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Authenticate a request with a SINGLE Supabase server client.
 * Returns { user, res, admin } or null if unauthenticated.
 * The `res` object carries any refreshed session cookies.
 */
export async function authenticateRequest() {
  const res = NextResponse.json({});
  const supabase = await createSupabaseServerClient(res);
  if (!supabase) {
    return { error: NextResponse.json({ error: "Supabase not configured" }, { status: 503 }) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { error: NextResponse.json({ error: "Supabase not configured" }, { status: 503 }) };
  }

  return { user, res, admin };
}

/**
 * Merge refreshed cookies from `res` into a JSON response.
 * Use this to return data while propagating any session cookie updates.
 */
export function withCookies(res: NextResponse, body: unknown, status = 200) {
  const cookieHeaders = res.cookies
    .getAll()
    .map((c) => c.toString());
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (cookieHeaders.length > 0) {
    headers.set("set-cookie", cookieHeaders.join(", "));
  }
  return new NextResponse(JSON.stringify(body), { status, headers });
}

/**
 * Get store_id for a given user.
 */
export async function getStoreId(userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from("stores")
    .select("id")
    .eq("user_id", userId)
    .single();
  return data?.id || null;
}
