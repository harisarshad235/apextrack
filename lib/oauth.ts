import 'server-only';

import { eq, or, and, sql } from 'drizzle-orm';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDb } from '@/lib/db';
import { users, User } from '@/db/schema';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import { createSessionToken } from '@/lib/auth';

/**
 * Reads an environment variable from Cloudflare context, Node process.env,
 * or directly parses local env files if running in dev and process.env wasn't reloaded yet.
 */
function readEnvFromFile(key: string): string | undefined {
  try {
    if (typeof process === 'undefined' || !process.cwd) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const envFiles = ['.env.local', '.env', '.dev.vars'];
    for (const file of envFiles) {
      const fullPath = path.resolve(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const k = trimmed.substring(0, eqIdx).trim();
            if (k === key) {
              let v = trimmed.substring(eqIdx + 1).trim();
              if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
                v = v.slice(1, -1);
              }
              return v;
            }
          }
        }
      }
    }
  } catch {}
  return undefined;
}

export function getOAuthEnv(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    if ((env as any)?.[key]) {
      const val = String((env as any)[key]).trim();
      return val.replace(/^["']|["']$/g, '');
    }
  } catch {}

  const envVal = process.env[key];
  if (envVal) {
    return String(envVal).trim().replace(/^["']|["']$/g, '');
  }

  // Fallback to disk read in development if the server hasn't been restarted
  const fileVal = readEnvFromFile(key);
  if (fileVal) {
    try {
      process.env[key] = fileVal;
    } catch {}
    return fileVal;
  }

  return undefined;
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
