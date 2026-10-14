import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static assets, API endpoints, icons, and files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Allow public marketing pages and auth flows without middleware redirection loops
  if (
    pathname === '/' ||
    pathname.startsWith('/landing') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/awaiting-approval')
  ) {
    return NextResponse.next();
  }

  // 3. Protected workspace routes (e.g. /dashboard, /projects):
  // Check if session cookie exists. If none, redirect to /login.
  const sessionCookie =
    request.cookies.get('kynov_session')?.value ||
    request.cookies.get('apex_session')?.value ||
    request.cookies.get('apex_session_user_id')?.value;
  const devCookie =
    request.cookies.get('kynov_dev_user_id')?.value ||
    request.cookies.get('apex_dev_user_id')?.value;

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
