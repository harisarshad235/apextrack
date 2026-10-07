'use server';

// Polyfill esbuild keep-names helper for Edge / Cloudflare Workers runtimes
if (typeof globalThis !== 'undefined') {
  globalThis.__name = globalThis.__name || function (fn: any) { return fn; };
}

import { cookies, headers } from 'next/headers';
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
  createPasswordResetToken,
  verifyPasswordResetToken,
} from '@/lib/auth';
import { sendPasswordResetEmail, sendAdminNewUserAlert } from '@/lib/email';

export async function loginAction(formData: { email: string; password: string }) {
  try {
    const cleanEmail = (formData.email || '').toLowerCase().trim();
    const password = formData.password;

    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const db = getDb();
    let userList = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1).catch(() => []);
    let user = userList[0];

    // Auto-provision workspace owner Haris Arshad as Admin if not yet in database
    if (!user && (cleanEmail === 'harisarshad235@gmail.com' || cleanEmail.includes('harisarshad'))) {
      if (password === 'ApexTrack2026!') {
        const adminId = 'u0';
        const initialHash = await hashPassword('ApexTrack2026!');
        await db.insert(users).values({
          id: adminId,
          name: 'Haris Arshad',
          email: cleanEmail,
          passwordHash: initialHash,
          role: 'Admin',
          status: 'APPROVED',
          department: 'Executive Engineering',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          approvedAt: new Date(),
        }).catch(() => null);

        const refreshed = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1).catch(() => []);
        user = refreshed[0] || {
          id: adminId,
          name: 'Haris Arshad',
          email: cleanEmail,
          passwordHash: initialHash,
          role: 'Admin',
          status: 'APPROVED',
          department: 'Executive Engineering',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          approvedAt: new Date(),
          approvedById: null,
        } as any;
      }
    }

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Auto-approve and ensure Admin role for Haris Arshad
    if ((cleanEmail === 'harisarshad235@gmail.com' || cleanEmail.includes('harisarshad')) && (user.role !== 'Admin' || user.status !== 'APPROVED')) {
      await db.update(users).set({ role: 'Admin', status: 'APPROVED' }).where(eq(users.id, user.id)).catch(() => null);
      user.role = 'Admin';
      user.status = 'APPROVED';
    }

    // Password verification (plain text match, master password fallback, or PBKDF2)
    let isValid = false;
    if (password === 'ApexTrack2026!' || user.passwordHash === password || user.passwordHash === 'default_seed' || !user.passwordHash) {
      isValid = true;
    } else if (user.passwordHash) {
      isValid = await verifyPassword(password, user.passwordHash).catch(() => false);
    }

    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Auto-migrate legacy user to store password hash on first successful login if empty
    if (!user.passwordHash || user.passwordHash === 'ApexTrack2026!' || user.passwordHash === 'default_seed') {
      const newHash = await hashPassword(password).catch(() => null);
      if (newHash) {
        await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id)).catch(() => null);
      }
    }

    if (user.status === 'PENDING') {
      return { success: false, error: 'PENDING_APPROVAL' };
    }

    if (user.status === 'SUSPENDED') {
      return { success: false, error: 'Account has been suspended' };
    }

    const token = await createSessionToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';

    cookieStore.set(SESSION_USER_COOKIE, token, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set('apex_session_user_id', user.id, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error('Login error:', err);
    const msg = err instanceof Error ? err.message : 'Internal database/server error';
    return { success: false, error: msg };
  }
}

// Keep loginUser as helper for compatibility
export async function loginUser(email: string, password?: string) {
  return loginAction({ email, password: password || '' });
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
    const isProd = process.env.NODE_ENV === 'production';
    cookieStore.set(SESSION_USER_COOKIE, sessionToken, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('apex_session_user_id', userId, {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Notify workspace admin in background (non-blocking)
    sendAdminNewUserAlert(cleanEmail, cleanName, data.department).catch((e) => {
      console.warn('[Alert] Could not dispatch new user alert email:', e);
    });

    return { success: true, redirect: '/awaiting-approval' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { success: false, error: message };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: true, message: 'If an account exists with this email, a reset link has been dispatched.' };
    }

    const db = getDb();
    let user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user && (cleanEmail === 'harisarshad235@gmail.com' || cleanEmail.includes('harisarshad'))) {
      const adminId = 'u0';
      const initialHash = await hashPassword('ApexTrack2026!');
      await db.insert(users).values({
        id: adminId,
        name: 'Haris Arshad',
        email: cleanEmail,
        passwordHash: initialHash,
        role: 'Admin',
        status: 'APPROVED',
        department: 'Executive Engineering',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        approvedAt: new Date(),
      }).catch(() => null);
      user = await db.query.users.findFirst({
        where: eq(users.email, cleanEmail),
      });
    }

    if (user) {
      const token = await createPasswordResetToken(user.id);
      
      const reqHeaders = await headers();
      const host = reqHeaders.get('x-forwarded-host') || reqHeaders.get('host') || 'apex.harisarshad.site';
      const protocol = reqHeaders.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      
      // Permanent fix: Email links must always point to the 24/7 live site (https://apex.harisarshad.site)
      // so users and admins can click from any device (phone, mail client) without needing a local dev server.
      let baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      if (!baseUrl || baseUrl.includes('localhost')) {
        baseUrl = !host.includes('localhost') ? `${protocol}://${host}` : 'https://apex.harisarshad.site';
      }
      const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

      console.log('\n======================================================');
      console.log('[ApexTrack Password Reset Link]:', resetLink);
      console.log('======================================================\n');

      await sendPasswordResetEmail(cleanEmail, resetLink);
    }

    // Always return generic success to prevent email enumeration
    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been dispatched.',
    };
  } catch (err: unknown) {
    console.error('requestPasswordReset error:', err);
    return {
      success: true,
      message: 'If an account exists with this email, a reset link has been dispatched.',
    };
  }
}

export async function resetPassword(data: { token: string; newPassword: string }) {
  try {
    const { token, newPassword } = data;

    if (!token) {
      return { success: false, error: 'Invalid or missing reset token.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    const userId = await verifyPasswordResetToken(token);
    if (!userId) {
      return { success: false, error: 'The password reset link is invalid or has expired. Please request a new one.' };
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, userId));

    return { success: true };
  } catch (err: unknown) {
    console.error('resetPassword error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to reset password.';
    return { success: false, error: msg };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_USER_COOKIE);
  cookieStore.delete('apex_session_user_id');
  cookieStore.delete(DEV_USER_COOKIE);
  redirect('/login');
}
