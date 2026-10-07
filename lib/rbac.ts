import 'server-only';
import { sql, eq } from 'drizzle-orm';
import { getDb } from './db';
import { users } from '@/db/schema';

let tablesInitialized = false;

/**
 * Ensures project_members table and is_archived column exist in Cloudflare D1.
 * Self-healing schema migration for zero-downtime edge runtime.
 */
export async function ensureProjectRbacTables(dbInstance?: ReturnType<typeof getDb>) {
  if (tablesInitialized) return;
  const db = dbInstance || getDb();

  try {
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_role TEXT NOT NULL DEFAULT 'MEMBER',
        created_at INTEGER DEFAULT (unixepoch() * 1000)
      )
    `);
  } catch {
    // table may already exist
  }

  try {
    await db.run(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS project_members_proj_user_uq ON project_members(project_id, user_id)
    `);
  } catch {
    // index may already exist
  }

  try {
    await db.run(sql`
      ALTER TABLE projects ADD COLUMN is_archived INTEGER DEFAULT 0
    `);
  } catch {
    // column may already exist
  }

  // Seed default memberships if empty so seeded demo users retain access
  try {
    const existing = await db.all<{ count: number }>(sql`SELECT count(*) as count FROM project_members`);
    if (!existing || existing[0]?.count === 0) {
      // Add lead_id as PROJECT_MANAGER for existing projects
      await db.run(sql`
        INSERT OR IGNORE INTO project_members (id, project_id, user_id, project_role)
        SELECT 'pm-' || id || '-' || lead_id, id, lead_id, 'PROJECT_MANAGER'
        FROM projects WHERE lead_id IS NOT NULL
      `);
      // Add issue assignees as members
      await db.run(sql`
        INSERT OR IGNORE INTO project_members (id, project_id, user_id, project_role)
        SELECT DISTINCT 'pm-' || project_id || '-' || assignee_id, project_id, assignee_id, 'MEMBER'
        FROM issues WHERE project_id IS NOT NULL AND assignee_id IS NOT NULL
      `);
    }
  } catch {
    // ignore
  }

  tablesInitialized = true;
}

/**
 * Access Verification Helper
 * 
 * Access Rules:
 * 1. Workspace Super Admins (role === 'Admin' || role === 'ADMIN') and CTOs (designation?.toUpperCase() === 'CTO')
 *    have global bypass access.
 * 2. Regular users must have an active record in the project_members table (user_id = ? AND project_id = ?).
 * 3. If requiredRole === 'PROJECT_MANAGER', verify that project_members.project_role equals 'PROJECT_MANAGER'.
 */
export async function verifyProjectAccess(
  userId: string,
  projectId: string,
  requiredRole?: 'PROJECT_MANAGER' | 'ADMIN'
): Promise<boolean> {
  if (!userId || !projectId) {
    return false;
  }

  const db = getDb();
  await ensureProjectRbacTables(db);

  // 1. Fetch user from DB
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.status === 'SUSPENDED') {
    return false;
  }

  // Check Workspace Super Admins
  const roleStr = String(user.role || '');
  const isSuperAdmin = roleStr === 'Admin' || roleStr === 'ADMIN' || roleStr.toUpperCase() === 'ADMIN';

  // Check CTOs
  const designation = (user as any).designation || user.department;
  const isCTO = designation?.toUpperCase() === 'CTO';

  // Global bypass for Workspace Super Admins and CTOs
  if (isSuperAdmin || isCTO) {
    return true;
  }

  // 2. Regular users must have an active record in project_members
  const members = await db.all<{
    id: string;
    project_id: string;
    user_id: string;
    project_role: string;
  }>(sql`
    SELECT id, project_id, user_id, project_role
    FROM project_members
    WHERE user_id = ${userId} AND project_id = ${projectId}
  `);

  if (!members || members.length === 0) {
    return false;
  }

  const member = members[0];

  // 3. Verify required role if requested
  if (requiredRole === 'PROJECT_MANAGER') {
    return member.project_role === 'PROJECT_MANAGER';
  }

  if (requiredRole === 'ADMIN') {
    return member.project_role === 'ADMIN' || member.project_role === 'PROJECT_MANAGER';
  }

  return true;
}
