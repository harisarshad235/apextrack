'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { users } from '@/db/schema';
import {
  SESSION_USER_COOKIE,
  DEV_USER_COOKIE,
  hashPassword,
  verifyPassword,
  createSessionToken,
} from '@/lib/auth';

export async function loginUser(email: string, password?: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return { success: false, error: 'Email address is required.' };
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid business email address.' };
    }

    if (!password) {
      return { success: false, error: 'Password is required to sign in.' };
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    // Auto-migrate legacy user to store password hash on first successful login if empty
    if (!user.passwordHash) {
      const newHash = await hashPassword(password);
      await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));
    }

    if (user.status === 'SUSPENDED') {
      return {
        success: false,
        error: 'Account has been suspended. Please contact an organization Admin.',
      };
    }

    const sessionToken = await createSessionToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_USER_COOKIE, sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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

    if (!data.password || data.password.length < 6) {
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
    const hashedPassword = await hashPassword(data.password);

    // Strictly register with status 'PENDING'
    await db.insert(users).values({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashedPassword,
      role: 'Viewer',
      status: 'PENDING',
      department: data.department?.trim() || 'Engineering',
      avatarUrl: null,
    });

    const sessionToken = await createSessionToken({ userId, role: 'Viewer' });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_USER_COOKIE, sessionToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
  cookieStore.delete('apex_session_user_id');
  cookieStore.delete(DEV_USER_COOKIE);
  redirect('/login');
}
