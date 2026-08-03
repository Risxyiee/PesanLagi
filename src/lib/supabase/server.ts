import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Create a Supabase client for use in Server Components / Route Handlers.
 * Uses the ANON key + request cookies so it respects RLS.
 */
export async function createSupabaseServerClient(response?: NextResponse) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from Server Component — ignore
        }
        if (response) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      },
    },
  });
}

/**
 * Create a Supabase ADMIN client (service_role key) that bypasses RLS.
 * Use ONLY in server-side code — never expose to the client.
 */
export function createSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }

  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
}
