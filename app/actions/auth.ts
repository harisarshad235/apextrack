'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { SESSION_USER_COOKIE, DEV_USER_COOKIE } from '@/lib/auth';

export async function loginUser(email: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return { success: false, error: 'Email address is required.' };

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email address. Please register.',
      };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_USER_COOKIE, user.id, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (user.status === 'PENDING') {
      return { success: true, redirect: '/awaiting-approval' };
    }

    return { success: true, redirect: '/' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { success: false, error: message };
  }
}

export async function registerUser(data: {
  name: string;
  email: string;
  department?: string;
}) {
  try {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanName = data.name.trim();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Name and Email are required.' };
    }

    const db = getDb();
    const existing = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const userId = `u-${Date.now()}`;
    const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`;

    await db.insert(users).values({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role: 'Viewer',
      status: 'PENDING',
      department: data.department?.trim() || 'Engineering',
      avatarUrl: avatar,
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_USER_COOKIE, userId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return { success: true, redirect: '/awaiting-approval' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { success: false, error: message };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_USER_COOKIE);
  cookieStore.delete(DEV_USER_COOKIE);
  redirect('/login');
}
