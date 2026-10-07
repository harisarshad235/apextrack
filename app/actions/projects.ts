'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole, getCurrentUser } from '@/lib/auth';
import { verifyProjectAccess, ensureProjectRbacTables } from '@/lib/rbac';
import { projects, swimlanes, projectCounters, ProjectStatus } from '@/db/schema';
import { Project } from '@/lib/types';

/**
 * Fetch projects accessible to the current session user.
 * - Admins and CTOs receive all active projects (WHERE is_archived = 0 ORDER BY name ASC).
 * - Non-admin users only receive projects assigned to them in project_members.
 */
export async function getUserProjectsAction(): Promise<Project[]> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return [];
    }

    const db = getDb();
    await ensureProjectRbacTables(db);

    const roleStr = String(currentUser.role || '');
    const isAdmin = roleStr === 'Admin' || roleStr === 'ADMIN' || roleStr.toUpperCase() === 'ADMIN';
    const designation = (currentUser as any).designation || currentUser.department;
    const isCTO = designation?.toUpperCase() === 'CTO';

    if (isAdmin || isCTO) {
      // Admin / CTO bypass: all active projects
      const activeProjects = await db.all<Project>(sql`
        SELECT p.*
        FROM projects p
        WHERE (p.is_archived = 0 OR (p.is_archived IS NULL AND p.status != 'archived'))
        ORDER BY p.name ASC
      `);
      return activeProjects;
    }

    // Regular users: inner join with project_members
    const assignedProjects = await db.all<Project>(sql`
      SELECT DISTINCT p.*
      FROM projects p
      INNER JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ${currentUser.id}
        AND (p.is_archived = 0 OR (p.is_archived IS NULL AND p.status != 'archived'))
      ORDER BY p.name ASC
    `);

    return assignedProjects;
  } catch (err: unknown) {
    console.error('Failed to get user projects:', err);
    return [];
  }
}

/**
 * Assign a user to a project with a specific role.
 * Guard: caller must be Admin, CTO, or Project Manager on projectId.
 */
export async function assignUserToProject({
  projectId,
  targetUserId,
  projectRole = 'MEMBER',
}: {
  projectId: string;
  targetUserId: string;
  projectRole?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Unauthenticated: Please log in.' };
    }

    // Guard: caller must be an Admin, CTO, or Project Manager on projectId
    const isAuthorized = await verifyProjectAccess(currentUser.id, projectId, 'PROJECT_MANAGER');
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Requires Admin, CTO, or Project Manager role on this project.',
      };
    }

    const db = getDb();
    await ensureProjectRbacTables(db);

    const memberId = `pm-${projectId}-${targetUserId}`;
    const cleanRole = projectRole === 'PROJECT_MANAGER' ? 'PROJECT_MANAGER' : (projectRole || 'MEMBER');

    // Upsert into project_members
    await db.run(sql`
      INSERT INTO project_members (id, project_id, user_id, project_role)
      VALUES (${memberId}, ${projectId}, ${targetUserId}, ${cleanRole})
      ON CONFLICT(project_id, user_id) DO UPDATE SET project_role = excluded.project_role
    `);

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/');
    return { success: true, message: 'User assigned to project successfully.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to assign user to project';
    return { success: false, error: message };
  }
}

/**
 * Remove a user from a project.
 * Guard: caller must have project manager or admin permissions.
 */
export async function removeUserFromProject({
  projectId,
  targetUserId,
}: {
  projectId: string;
  targetUserId: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Unauthenticated: Please log in.' };
    }

    // Guard: caller must have project manager or admin permissions
    const isAuthorized = await verifyProjectAccess(currentUser.id, projectId, 'PROJECT_MANAGER');
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Requires Project Manager or Admin permissions.',
      };
    }

    const db = getDb();
    await ensureProjectRbacTables(db);

    await db.run(sql`
      DELETE FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${targetUserId}
    `);

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/');
    return { success: true, message: 'User removed from project successfully.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to remove user from project';
    return { success: false, error: message };
  }
}

/**
 * Get assigned members for a project.
 */
export async function getProjectMembersAction(projectId: string) {
  try {
    const db = getDb();
    await ensureProjectRbacTables(db);

    const members = await db.all<{
      id: string;
      projectId: string;
      userId: string;
      projectRole: string;
      userName: string;
      userEmail: string;
      userRole: string;
      avatarUrl: string | null;
      department: string | null;
    }>(sql`
      SELECT
        pm.id,
        pm.project_id as projectId,
        pm.user_id as userId,
        pm.project_role as projectRole,
        u.name as userName,
        u.email as userEmail,
        u.role as userRole,
        u.avatar_url as avatarUrl,
        u.department as department
      FROM project_members pm
      INNER JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ${projectId}
      ORDER BY u.name ASC
    `);

    return members;
  } catch (err: unknown) {
    console.error('Failed to get project members:', err);
    return [];
  }
}

/**
 * Helper to check whether the current user can manage members of a project.
 */
export async function canManageProjectMembersAction(projectId: string): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;
    return await verifyProjectAccess(currentUser.id, projectId, 'PROJECT_MANAGER');
  } catch {
    return false;
  }
}

export async function createProject(data: {
  key: string;
  name: string;
  description?: string;
  category?: string;
  leadId?: string;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureProjectRbacTables(db);

    const cleanKey = data.key.trim().toUpperCase();
    const cleanName = data.name.trim();

    if (!cleanKey || !cleanName) {
      return { success: false, error: 'Project Key and Name are required.' };
    }

    if (!/^[A-Z0-9]{2,10}$/.test(cleanKey)) {
      return {
        success: false,
        error: 'Project Key must be 2 to 10 alphanumeric uppercase characters (e.g. APEX, CORE).',
      };
    }

    const existing = await db.query.projects.findFirst({
      where: eq(projects.key, cleanKey),
    });

    if (existing) {
      return {
        success: false,
        error: `A project with key "${cleanKey}" already exists.`,
      };
    }

    const projectId = `proj-${cleanKey.toLowerCase()}-${Date.now().toString(36)}`;
    const effectiveLeadId = data.leadId || currentUser.id;

    // 1. Create project
    await db.insert(projects).values({
      id: projectId,
      key: cleanKey,
      name: cleanName,
      description: data.description?.trim() || '',
      category: data.category?.trim() || 'Software',
      leadId: effectiveLeadId,
      status: 'active',
    });

    // 2. Initialize project issue key counter
    await db.insert(projectCounters).values({
      projectKey: cleanKey,
      nextSeq: 101,
    }).onConflictDoNothing();

    // 3. Automatically assign creator / lead to project_members as PROJECT_MANAGER
    const pmId = `pm-${projectId}-${effectiveLeadId}`;
    await db.run(sql`
      INSERT INTO project_members (id, project_id, user_id, project_role)
      VALUES (${pmId}, ${projectId}, ${effectiveLeadId}, 'PROJECT_MANAGER')
      ON CONFLICT(project_id, user_id) DO UPDATE SET project_role = 'PROJECT_MANAGER'
    `);

    // 4. Create initial 4 default swimlanes for this project
    const defaultLanes = [
      {
        name: 'To Do',
        statusKey: 'To Do',
        color: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50',
        sortOrder: 0,
      },
      {
        name: 'In Progress',
        statusKey: 'In Progress',
        color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
        sortOrder: 1,
      },
      {
        name: 'In Review',
        statusKey: 'In Review',
        color: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20',
        sortOrder: 2,
      },
      {
        name: 'Done',
        statusKey: 'Done',
        color: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
        sortOrder: 3,
      },
    ];

    for (const lane of defaultLanes) {
      await db.insert(swimlanes).values({
        id: `lane-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectId,
        name: lane.name,
        statusKey: lane.statusKey,
        color: lane.color,
        sortOrder: lane.sortOrder,
      });
    }

    revalidatePath('/');
    return { success: true, projectId, message: `Project ${cleanName} (${cleanKey}) created` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return { success: false, error: message };
  }
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    leadId?: string;
    status?: ProjectStatus;
  }
) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureProjectRbacTables(db);

    const existing = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!existing) {
      return { success: false, error: 'Project not found.' };
    }

    const updateData: {
      name?: string;
      description?: string;
      category?: string;
      leadId?: string;
      status?: ProjectStatus;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined && data.name.trim()) {
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }
    if (data.category !== undefined) {
      updateData.category = data.category.trim();
    }
    if (data.leadId !== undefined) {
      updateData.leadId = data.leadId;
      // If lead changed, assign new lead as PROJECT_MANAGER
      if (data.leadId) {
        const pmId = `pm-${projectId}-${data.leadId}`;
        await db.run(sql`
          INSERT INTO project_members (id, project_id, user_id, project_role)
          VALUES (${pmId}, ${projectId}, ${data.leadId}, 'PROJECT_MANAGER')
          ON CONFLICT(project_id, user_id) DO UPDATE SET project_role = 'PROJECT_MANAGER'
        `);
      }
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'archived') {
        await db.run(sql`UPDATE projects SET is_archived = 1 WHERE id = ${projectId}`);
      } else {
        await db.run(sql`UPDATE projects SET is_archived = 0 WHERE id = ${projectId}`);
      }
    }

    await db.update(projects).set(updateData).where(eq(projects.id, projectId));

    revalidatePath('/');
    return { success: true, message: 'Project updated' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update project';
    return { success: false, error: message };
  }
}

export async function deleteProject(projectId: string) {
  try {
    await requireRole(['Admin']);
    const db = getDb();
    await ensureProjectRbacTables(db);

    const existing = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!existing) {
      return { success: false, error: 'Project not found.' };
    }

    // Instead of destructive drop, archive the project
    await db.update(projects).set({
      status: 'archived',
      updatedAt: new Date(),
    }).where(eq(projects.id, projectId));

    await db.run(sql`UPDATE projects SET is_archived = 1 WHERE id = ${projectId}`);

    revalidatePath('/');
    return { success: true, message: `Archived project ${existing.name}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to archive project';
    return { success: false, error: message };
  }
}
