import { NextRequest, NextResponse } from 'next/server';

/**
 * Strict Allowed CORS Origins for Kynov.
 * Includes production custom domains, Cloudflare Workers dev domain,
 * and local loopback origins when running in development.
 */
export const ALLOWED_ORIGINS = [
  'https://kynov.harisarshad.site',
  'https://kynov.harisarshad235.workers.dev',
];

export const DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  
  const cleanOrigin = origin.trim().replace(/\/$/, '').toLowerCase();
  
  if (ALLOWED_ORIGINS.some((allowed) => allowed.toLowerCase() === cleanOrigin)) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && process.env.AUTH_MODE !== 'production') {
    if (DEV_ALLOWED_ORIGINS.some((allowed) => allowed.toLowerCase() === cleanOrigin)) {
      return true;
    }
  }

  return false;
}

/**
 * Generates CORS headers for a validated origin.
 */
export function getCorsHeaders(origin: string | null | undefined): Record<string, string> {
  if (!origin || !isAllowedOrigin(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Entity-Ref-ID',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handles CORS preflight and validation for API routes.
 */
export function handleApiCors(request: NextRequest | Request): NextResponse | null {
  const origin = request.headers.get('origin');
  
  // If no Origin header is sent (e.g. server-to-server webhooks or direct browser navigation), allow through
  if (!origin) {
    return null;
  }

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    if (isAllowedOrigin(origin)) {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }
    return new NextResponse('CORS origin forbidden', { status: 403 });
  }

  // If request has an untrusted Origin, reject with 403 Forbidden
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: 'CORS policy violation: Unauthorized origin' },
      { status: 403 }
    );
  }

  return null;
}
