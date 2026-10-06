import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api routes, icons, and public auth endpoints
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/awaiting-approval') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get('apex_session')?.value ||
    request.cookies.get('apex_session_user_id')?.value;
  const devCookie = request.cookies.get('apex_dev_user_id')?.value;

  // If no auth cookie exists, redirect immediately to login
  if (!sessionCookie && !devCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (vector favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
