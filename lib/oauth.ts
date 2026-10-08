import 'server-only';

import { eq, or, and, sql } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { users, User } from '@/db/schema';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import { createSessionToken } from '@/lib/auth';

/**
 * Reads an environment variable either from Cloudflare Workers context or Node process.env
 */
export function getOAuthEnv(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    if ((env as any)?.[key]) return (env as any)[key];
  } catch {}
  return process.env[key];
}

export function getAppBaseUrl(req?: Request): string {
  if (req) {
    try {
      const url = new URL(req.url);
      return `${url.protocol}//${url.host}`;
    } catch {}
  }
  return (
    getOAuthEnv('NEXT_PUBLIC_APP_URL') ||
    getOAuthEnv('NEXTAUTH_URL') ||
    'https://apex.harisarshad.site'
  ).replace(/\/$/, '');
}

export interface OAuthUserProfile {
  provider: 'GOOGLE' | 'GITHUB';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

/**
 * Handle D1 User Handshake:
 * 1. Checks if user exists with matching auth_provider & provider_id or email
 * 2. If exists, links provider and updates avatar
 * 3. If new, inserts user with role='Member' and status='APPROVED'
 * 4. Links user to default workspace/project
 * 5. Returns signed session token
 */
export async function handleOAuthUserHandshake(profile: OAuthUserProfile): Promise<{
  user: User;
  sessionToken: string;
}> {
  const db = getDb();
  await ensureEnterpriseSchema(db);

  const cleanEmail = profile.email.toLowerCase().trim();

  // 1. Check existing user
  const existingUser = await db.query.users.findFirst({
    where: or(
      and(eq(users.authProvider, profile.provider), eq(users.providerId, profile.providerId)),
      eq(users.email, cleanEmail)
    ),
  });

  let targetUser: User;

  if (existingUser) {
    // Update existing user with OAuth identity and avatar
    await db
      .update(users)
      .set({
        authProvider: profile.provider,
        providerId: profile.providerId,
        avatarUrl: profile.avatarUrl || existingUser.avatarUrl,
        status: existingUser.status === 'SUSPENDED' ? 'SUSPENDED' : 'APPROVED',
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    targetUser = (await db.query.users.findFirst({ where: eq(users.id, existingUser.id) })) || existingUser;
  } else {
    // Insert new user
    const newUserId = `u-${profile.provider.toLowerCase()}-${Date.now()}`;
    const newUserRecord = {
      id: newUserId,
      name: profile.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'Member' as const,
      status: 'APPROVED' as const,
      authProvider: profile.provider,
      providerId: profile.providerId,
      department: 'Engineering',
      avatarUrl: profile.avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(users).values(newUserRecord);
    targetUser = (await db.query.users.findFirst({ where: eq(users.id, newUserId) }))!;
  }

  // 2. Automatically link user to default workspace/project ('proj-apex') in project_members
  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_role TEXT NOT NULL DEFAULT 'MEMBER',
        created_at INTEGER DEFAULT (unixepoch() * 1000) NOT NULL
      )
    `);

    const memberId = `pm-${targetUser.id}-apex`;
    await db.run(sql`
      INSERT OR IGNORE INTO project_members (id, project_id, user_id, project_role)
      VALUES (${memberId}, 'proj-apex', ${targetUser.id}, 'MEMBER')
    `);
  } catch {
    // Ignore if table or record exists
  }

  // 3. Generate signed session token
  const sessionToken = await createSessionToken({
    userId: targetUser.id,
    role: targetUser.role,
  });

  return { user: targetUser, sessionToken };
}
