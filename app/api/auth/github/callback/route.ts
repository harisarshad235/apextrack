import { NextRequest, NextResponse } from 'next/server';
import { getOAuthEnv, getAppBaseUrl, handleOAuthUserHandshake } from '@/lib/oauth';
import { SESSION_USER_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');

  if (error || !code) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', error || 'github_auth_failed');
    return NextResponse.redirect(loginUrl);
  }

  const clientId = getOAuthEnv('GITHUB_CLIENT_ID');
  const clientSecret = getOAuthEnv('GITHUB_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_config_missing');
    loginUrl.searchParams.set('provider', 'GitHub');
    return NextResponse.redirect(loginUrl);
  }

  const baseUrl = getAppBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[GitHubOAuth] Token error:', tokenData);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'token_exchange_failed');
      return NextResponse.redirect(loginUrl);
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'ApexTrack-OAuth',
      },
    });

    const userData = (await userRes.json()) as any;
    if (!userRes.ok || !userData.id) {
      console.error('[GitHubOAuth] Profile error:', userData);
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'profile_fetch_failed');
      return NextResponse.redirect(loginUrl);
    }

    // 3. Resolve user email (GitHub might not return email in /user if private)
    let email = userData.email;
    if (!email) {
      try {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'ApexTrack-OAuth',
          },
        });
        const emailsData = (await emailsRes.json()) as any[];
        if (Array.isArray(emailsData)) {
          const primary = emailsData.find((e) => e.primary && e.verified) || emailsData[0];
          if (primary) email = primary.email;
        }
      } catch (emailErr) {
        console.warn('[GitHubOAuth] Could not fetch private emails:', emailErr);
      }
    }

    if (!email) {
      email = `${userData.login}@users.noreply.github.com`;
    }

    // 4. Database handshake
    const { sessionToken } = await handleOAuthUserHandshake({
      provider: 'GITHUB',
      providerId: String(userData.id),
      email,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url || null,
    });

    // 5. Set session cookie and redirect to /dashboard
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
    console.error('[GitHubOAuth] Unexpected error:', err);
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('error', 'server_error');
    return NextResponse.redirect(loginUrl);
  }
}
