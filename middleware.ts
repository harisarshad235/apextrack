import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, api routes, icons, and assets
  if (
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
  const isAuthenticated = Boolean(sessionCookie || devCookie);

  const isExplicitOverview =
    request.nextUrl.searchParams.get('overview') === 'true' ||
    request.nextUrl.searchParams.get('preview') === 'true';

  // 1. Authenticated users: redirect root and auth pages to /dashboard
  if (isAuthenticated) {
    if (
      (pathname === '/' && !isExplicitOverview) ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/signup')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Unauthenticated visitors: allow marketing landing, explicit overview, and auth flows
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

  // 3. Protected workspace routes: redirect unauthenticated visitor to /login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
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
