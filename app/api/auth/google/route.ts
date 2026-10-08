import { NextRequest, NextResponse } from 'next/server';
import { getOAuthEnv, getAppBaseUrl } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = getOAuthEnv('GOOGLE_CLIENT_ID');

  if (!clientId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_config_missing');
    loginUrl.searchParams.set('provider', 'Google');
    return NextResponse.redirect(loginUrl);
  }

  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // Random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('access_type', 'online');

  const res = NextResponse.redirect(googleAuthUrl.toString());
  res.cookies.set('oauth_state_google', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return res;
}
