import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const { nextauth } = await context.params;
  const path = nextauth.join('/');

  if (path === 'signin/google' || path === 'google') {
    return NextResponse.redirect(new URL('/api/auth/google', req.url));
  }
  if (path === 'signin/github' || path === 'github') {
    return NextResponse.redirect(new URL('/api/auth/github', req.url));
  }
  if (path === 'callback/google') {
    const url = new URL('/api/auth/google/callback', req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url);
  }
  if (path === 'callback/github') {
    const url = new URL('/api/auth/github/callback', req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url);
  }

  return NextResponse.json({ message: 'ApexTrack OAuth Gateway Active' });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return GET(req, context);
}
