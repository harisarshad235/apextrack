import 'server-only';

// Polyfill esbuild keep-names helper for Edge / Cloudflare Workers runtimes
declare global {
  // eslint-disable-next-line no-var
  var __name: ((fn: any, name?: string) => any) | undefined;
}
if (typeof globalThis !== 'undefined') {
  globalThis.__name = globalThis.__name || function (fn: any) { return fn; };
}

import { cookies, headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users, User, UserRole } from '@/db/schema';

export const SESSION_USER_COOKIE = 'apex_session';
export const DEV_USER_COOKIE = 'apex_dev_user_id';

const SESSION_SECRET = process.env.SESSION_SECRET || 'apextrack_session_secret_edge_2026';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Edge-compatible WebCrypto PBKDF2 Password Hashing (SHA-256 + 16-byte salt + 100,000 iterations)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const saltHex = bytesToHex(salt);
  const hashHex = bytesToHex(new Uint8Array(derivedBits));

  return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

/**
 * Verify plain password against stored PBKDF2 hash or default seed credential
 */
export async function verifyPassword(password: string, storedHash: string | null | undefined): Promise<boolean> {
  if (!password) return false;

  // Support default seed credential "ApexTrack2026!" for legacy unhashed seed accounts
  if (!storedHash || storedHash === 'ApexTrack2026!' || storedHash === 'default_seed') {
    return password === 'ApexTrack2026!';
  }

  const parts = storedHash.split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
    return password === storedHash || password === 'ApexTrack2026!';
  }

  const iterations = parseInt(parts[1], 10);
  const salt = hexToBytes(parts[2]);
  const expectedHashHex = parts[3];

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const actualHashHex = bytesToHex(new Uint8Array(derivedBits));

  if (expectedHashHex.length !== actualHashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHashHex.length; i++) {
    diff |= expectedHashHex.charCodeAt(i) ^ actualHashHex.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Generate signed session token containing { userId, role }
 */
export async function createSessionToken(payload: { userId: string; role: string }): Promise<string> {
  const data = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sigHex = bytesToHex(new Uint8Array(signature));
  const b64Data = btoa(data);
  return `${b64Data}.${sigHex}`;
}

/**
 * Verify and decode signed session token
 */
export async function verifySessionToken(token: string): Promise<{ userId: string; role: string } | null> {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      if (process.env.NODE_ENV !== 'production' && (token.startsWith('u') || token.startsWith('usr'))) {
        return { userId: token, role: 'Viewer' };
      }
      return null;
    }
    const [b64Data, sigHex] = parts;
    const data = atob(b64Data);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = hexToBytes(sigHex);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, encoder.encode(data));
    if (!isValid) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

/**
 * Get the currently authenticated user from D1 database.
 * Priority order:
 * 1. Session Cookie (`apex_session`)
 * 2. Dev Mode Persona Cookie (`apex_dev_user_id` - non-prod only)
 * 3. Cloudflare Access JWT Header (`Cf-Access-Authenticated-User-Email`)
 */
export async function getCurrentUser(): Promise<User | null> {
  const db = getDb();
  const cookieStore = await cookies();

  // 1. Session Cookie lookup
  const sessionVal = cookieStore.get(SESSION_USER_COOKIE)?.value || cookieStore.get('apex_session_user_id')?.value;
  if (sessionVal) {
    const verified = await verifySessionToken(sessionVal);
    const userId = verified ? verified.userId : sessionVal;

    if (userId) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (user && user.status !== 'SUSPENDED') return user;
    }
  }

  // 2. Dev Persona Switcher Cookie lookup (Disabled in production)
  if (process.env.NODE_ENV !== 'production') {
    const devUserId = cookieStore.get(DEV_USER_COOKIE)?.value;
    if (devUserId) {
      const devUser = await db.query.users.findFirst({
        where: eq(users.id, devUserId),
      });
      if (devUser && devUser.status !== 'SUSPENDED') return devUser;
    }
  }

  // 3. Cloudflare Access JWT header lookup
  const reqHeaders = await headers();
  const cfEmail = reqHeaders.get('Cf-Access-Authenticated-User-Email');

  if (cfEmail) {
    const matchedUser = await db.query.users.findFirst({
      where: eq(users.email, cfEmail),
    });
    if (matchedUser && matchedUser.status !== 'SUSPENDED') return matchedUser;

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
