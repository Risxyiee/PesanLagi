import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh Supabase session for all matched routes
  const { supabase, response } = createMiddlewareClient(request);

  // This refreshes the auth token if needed
  await supabase.auth.getUser();

  // Protect /dashboard/* paths
  if (pathname.startsWith("/dashboard")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/#login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/callback",
  ],
};
