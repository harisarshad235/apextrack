import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { verifyPassword, hashPassword, createSessionToken } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const { email, password } = body || {};

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Auto-migrate legacy unhashed password if empty
    if (!user.passwordHash) {
      const newHash = await hashPassword(password);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
    }

    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account has been suspended. Please contact an Administrator.' },
        { status: 403 }
      );
    }

    if (user.status === 'PENDING') {
      return NextResponse.json({ error: 'PENDING_APPROVAL' }, { status: 403 });
    }

    const token = await createSessionToken({ userId: user.id, role: user.role });
    const res = NextResponse.json({ success: true, role: user.role });

    res.cookies.set('apex_session', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
