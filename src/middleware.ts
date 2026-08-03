import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /dashboard/* routes — redirect to hash-based SPA
  if (pathname.startsWith('/dashboard')) {
    const session = req.cookies.get('session');
    if (!session?.value) {
      // Redirect to login page (root with hash)
      const loginUrl = new URL('/#login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /auth/callback (client page) — redirect to login if accessed directly
  if (pathname === '/auth/callback' && !req.nextUrl.searchParams.get('code')) {
    return NextResponse.redirect(new URL('/#login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/callback'],
};
