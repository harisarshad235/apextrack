import { NextRequest, NextResponse } from 'next/server';
import { syncGithubWebhookAction } from '@/app/actions/git';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

async function verifyGithubSignature(secret: string, header: string, rawBody: string): Promise<boolean> {
  try {
    if (!header.startsWith('sha256=')) return false;
    const signature = header.slice(7);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
    const hex = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex === signature;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Edge rate limiting (max 60 webhook events per minute)
    const clientIp = await getClientIp();
    const rateLimit = await checkRateLimit(`webhook:github:${clientIp}`, 60, 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Webhook rate limit exceeded.' },
        { status: 429 }
      );
    }

    const rawBody = await req.text();
    if (!rawBody || rawBody.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Payload empty or exceeds 5MB limit' }, { status: 400 });
    }

    // 2. Secret verification if configured
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret) {
      const sigHeader = req.headers.get('x-hub-signature-256');
      if (!sigHeader || !(await verifyGithubSignature(webhookSecret, sigHeader, rawBody))) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    if (typeof payload !== 'object' || payload === null) {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const result = await syncGithubWebhookAction(payload);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid payload';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

