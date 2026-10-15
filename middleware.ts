import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleApiCors, isAllowedOrigin, getCorsHeaders } from '@/lib/cors';

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle API routes with strict CORS origin verification
  if (pathname.startsWith('/api')) {
    const corsResponse = handleApiCors(request);
    if (corsResponse) {
      return withSecurityHeaders(corsResponse);
    }

    const response = NextResponse.next();
    const origin = request.headers.get('origin');
    if (origin && isAllowedOrigin(origin)) {
      const corsHeaders = getCorsHeaders(origin);
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
      }
    }
    return withSecurityHeaders(response);
  }

  // 2. Allow static files, icons, and next internal assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Fast edge redirect from root "/" to "/dashboard" for authenticated users (0ms D1 query overhead)
  if (pathname === '/') {
    const isPreview =
      request.nextUrl.searchParams.get('overview') === 'true' ||
      request.nextUrl.searchParams.get('preview') === 'true';

    const sessionCookie =
      request.cookies.get('kynov_session')?.value ||
      request.cookies.get('apex_session')?.value ||
      request.cookies.get('apex_session_user_id')?.value;
    const devCookie =
      request.cookies.get('kynov_dev_user_id')?.value ||
      request.cookies.get('apex_dev_user_id')?.value;

    if ((sessionCookie || devCookie) && !isPreview) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return withSecurityHeaders(NextResponse.redirect(dashboardUrl));
    }
    return NextResponse.next();
  }

  // 3. Allow public marketing pages and auth flows without middleware redirection loops
  if (
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

  // 4. Protected workspace routes (e.g. /dashboard, /projects):
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
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (vector favicon)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
