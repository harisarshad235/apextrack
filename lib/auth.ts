import 'server-only';
import { cookies, headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users, User, UserRole } from '@/db/schema';

export const SESSION_USER_COOKIE = 'apex_session_user_id';
export const DEV_USER_COOKIE = 'apex_dev_user_id';

/**
 * Get the currently authenticated user from D1 database.
 * Priority order:
 * 1. Session Cookie (`apex_session_user_id`)
 * 2. Dev Mode Persona Cookie (`apex_dev_user_id`)
 * 3. Cloudflare Access JWT Header (`Cf-Access-Authenticated-User-Email`)
 */
export async function getCurrentUser(): Promise<User | null> {
  const db = getDb();
  const cookieStore = await cookies();

  // 1. Session Cookie lookup
  const sessionUserId = cookieStore.get(SESSION_USER_COOKIE)?.value;
  if (sessionUserId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, sessionUserId),
    });
    if (user) return user;
  }

  // 2. Dev Persona Switcher Cookie lookup
  const devUserId = cookieStore.get(DEV_USER_COOKIE)?.value;
  if (devUserId) {
    const devUser = await db.query.users.findFirst({
      where: eq(users.id, devUserId),
    });
    if (devUser) return devUser;
  }

  // 3. Cloudflare Access JWT header lookup
  const reqHeaders = await headers();
  const cfEmail = reqHeaders.get('Cf-Access-Authenticated-User-Email');

  if (cfEmail) {
    const matchedUser = await db.query.users.findFirst({
      where: eq(users.email, cfEmail),
    });
    if (matchedUser) return matchedUser;

    // Auto-provision unknown CF Access sign-ins as PENDING Viewer
    const newId = `u-${Date.now()}`;
    const newUser: typeof users.$inferInsert = {
      id: newId,
      name: cfEmail.split('@')[0].replace('.', ' '),
      email: cfEmail.toLowerCase().trim(),
      role: 'Viewer',
      status: 'PENDING',
      department: 'Cloudflare Access User',
    };
    await db.insert(users).values(newUser);
    return (await db.query.users.findFirst({ where: eq(users.id, newId) })) || null;
  }

  return null;
}

/**
 * Enforce RBAC permission server-side for Server Actions.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthenticated: Please log in to perform this action.');
  }

  if (user.status !== 'APPROVED') {
    throw new Error('Your account is PENDING approval by an organization Admin.');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized: Requires ${allowedRoles.join(' or ')} permissions.`);
  }

  return user;
}
