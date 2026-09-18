import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export interface AuthContext {
  user: { id: string; email?: string; [key: string]: any };
  storeId: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  admin: ReturnType<typeof createSupabaseAdminClient>;
}

/**
 * Authenticate a request and resolve store ownership in ONE pass.
 * Creates each Supabase client at most once (vs 3-4× in the old pattern).
 *
 * Returns null on failure — callers return their own 401/403/503.
 */
export async function authenticate(req: NextRequest, requireStore = true): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  if (!requireStore) return { user, storeId: "" as string, supabase, admin: null };

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data } = await admin
    .from("stores")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const storeId = data?.id || null;
  if (!storeId) return null;

  return { user, storeId, supabase, admin };
}

/** Shorthand: return the 503 error response for missing env vars. */
export function envNotConfigured() {
  return NextResponse.json(
    { error: "Supabase environment variables are not configured" },
    { status: 503 }
  );
}

/** Shorthand: return the 401 error response. */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Shorthand: return the 404 store-not-found response. */
export function storeNotFound() {
  return NextResponse.json({ error: "Store not found" }, { status: 404 });
}
