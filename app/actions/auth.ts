'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import { SESSION_USER_COOKIE, DEV_USER_COOKIE } from '@/lib/auth';

export async function loginUser(email: string, password?: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return { success: false, error: 'Email address is required.' };
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid business email address.' };
    }

    if (password !== undefined && password !== '' && password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      return {
        success: false,
        error: 'No account found with this email address. Please register for an account.',
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
  password?: string;
  department?: string;
}) {
  try {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanName = data.name.trim();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Full name and email are required.' };
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please provide a valid business email.' };
    }

    if (data.password !== undefined && data.password !== '' && data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const db = getDb();
    const existing = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const userId = `u-${Date.now()}`;

    // Strictly register with status 'PENDING'
    await db.insert(users).values({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      role: 'Viewer',
      status: 'PENDING',
      department: data.department?.trim() || 'Engineering',
      avatarUrl: null, // Clean name-initials badge fallback
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
