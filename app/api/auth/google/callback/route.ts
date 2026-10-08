import { NextRequest, NextResponse } from 'next/server';
import { getOAuthEnv, getAppBaseUrl, handleOAuthUserHandshake } from '@/lib/oauth';
import { SESSION_USER_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', error || 'google_auth_failed');
    return NextResponse.redirect(loginUrl);
  }

  const clientId = getOAuthEnv('GOOGLE_CLIENT_ID');
  const clientSecret = getOAuthEnv('GOOGLE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_config_missing');
    loginUrl.searchParams.set('provider', 'Google');
    return NextResponse.redirect(loginUrl);
  }

  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[GoogleOAuth] Token error:', tokenData);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'token_exchange_failed');
      return NextResponse.redirect(loginUrl);
    }

    // 2. Fetch user profile
    const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = (await userRes.json()) as any;
    if (!userRes.ok || !userData.email) {
      console.error('[GoogleOAuth] Profile error:', userData);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'profile_fetch_failed');
      return NextResponse.redirect(loginUrl);
    }

    // 3. Database handshake
    const { sessionToken } = await handleOAuthUserHandshake({
      provider: 'GOOGLE',
      providerId: userData.sub,
      email: userData.email,
      name: userData.name || userData.email.split('@')[0],
      avatarUrl: userData.picture || null,
    });

    // 4. Set session cookie and redirect to /dashboard
    const dashboardUrl = new URL('/dashboard', req.url);
    const res = NextResponse.redirect(dashboardUrl);

    res.cookies.set(SESSION_USER_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: unknown) {
    console.error('[GoogleOAuth] Unexpected error:', err);
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(loginUrl);
  }
}
