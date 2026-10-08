import { NextRequest, NextResponse } from 'next/server';
import { getOAuthEnv, getAppBaseUrl } from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientId = getOAuthEnv('GITHUB_CLIENT_ID');

  if (!clientId) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_config_missing');
    loginUrl.searchParams.set('provider', 'GitHub');
    return NextResponse.redirect(loginUrl);
  }

  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  // Random state for CSRF protection
  const state = Math.random().toString(36).substring(2, 15);

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', state);

  const res = NextResponse.redirect(githubAuthUrl.toString());
  res.cookies.set('oauth_state_github', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return res;
}
