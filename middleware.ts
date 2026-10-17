import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleApiCors, isAllowedOrigin, getCorsHeaders } from '@/lib/cors';

const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com;
  connect-src 'self' https://api.resend.com https://oauth2.googleapis.com https://openidconnect.googleapis.com https://github.com https://api.github.com https://*.workers.dev;
  frame-ancestors 'self';
  form-action 'self' https://github.com/login/oauth/authorize https://accounts.google.com/o/oauth2/v2/auth;
  base-uri 'self';
  object-src 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, ' ')
  .trim();

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Content-Security-Policy', CSP_HEADER);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDevAuthAllowed = process.env.NODE_ENV !== 'production' && process.env.AUTH_MODE !== 'production';

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
    const devCookie = isDevAuthAllowed
      ? (request.cookies.get('kynov_dev_user_id')?.value || request.cookies.get('apex_dev_user_id')?.value)
      : undefined;

    if ((sessionCookie || devCookie) && !isPreview) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return withSecurityHeaders(NextResponse.redirect(dashboardUrl));
    }
    return withSecurityHeaders(NextResponse.next());
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
    return withSecurityHeaders(NextResponse.next());
  }

  // 4. Protected workspace routes (e.g. /dashboard, /projects):
  // Check if session cookie exists. If none, redirect to /login.
  const sessionCookie =
    request.cookies.get('kynov_session')?.value ||
    request.cookies.get('apex_session')?.value ||
    request.cookies.get('apex_session_user_id')?.value;
  const devCookie = isDevAuthAllowed
    ? (request.cookies.get('kynov_dev_user_id')?.value || request.cookies.get('apex_dev_user_id')?.value)
    : undefined;

  if (!sessionCookie && !devCookie) {
    const loginUrl = new URL('/login', request.url);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return withSecurityHeaders(NextResponse.next());
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
