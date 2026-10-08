import { NextRequest, NextResponse } from 'next/server';
import { syncGithubWebhookAction } from '@/app/actions/git';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = await syncGithubWebhookAction(payload);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid payload';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
