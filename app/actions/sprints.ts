'use server';

import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getCurrentUser, requireRole } from '@/lib/auth';
import { verifyProjectAccess } from '@/lib/rbac';
import { sprints, Sprint } from '@/db/schema';

let sprintTablesInitialized = false;

/**
 * Ensures table `sprints` has:
 * - status TEXT NOT NULL DEFAULT 'PLANNED' ('PLANNED', 'ACTIVE', 'CLOSED')
 * - completed_at TIMESTAMP
 * - project_id TEXT
 * - idx_sprints_project_status index
 */
export async function ensureSprintTables(dbInstance?: ReturnType<typeof getDb>) {
  if (sprintTablesInitialized) return;
  const db = dbInstance || getDb();

  try {
    await db.run(sql`ALTER TABLE sprints ADD COLUMN project_id TEXT REFERENCES projects(id)`);
  } catch {}

  try {
    await db.run(sql`ALTER TABLE sprints ADD COLUMN status TEXT NOT NULL DEFAULT 'PLANNED'`);
  } catch {}

  try {
    await db.run(sql`ALTER TABLE sprints ADD COLUMN completed_at INTEGER`);
  } catch {}

  try {
    await db.run(sql`
      UPDATE sprints
      SET status = CASE
        WHEN state = 'active' THEN 'ACTIVE'
        WHEN state = 'closed' THEN 'CLOSED'
        ELSE 'PLANNED'
      END
      WHERE status = 'PLANNED' AND state IS NOT NULL
    `);
  } catch {}

  try {
    await db.run(sql`
      CREATE INDEX IF NOT EXISTS idx_sprints_project_status ON sprints(project_id, status)
    `);
  } catch {}

  sprintTablesInitialized = true;
}

export interface UpdateSprintInput {
  sprintId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string | null;
}

export interface UpdateSprintResult {
  success: boolean;
  message?: string;
  error?: string;
  sprint?: Sprint;
}

/**
 * Server Action to update sprint settings (Name, Start Date, End Date, Goal).
 */
export async function updateSprintAction({
  sprintId,
  name,
  startDate,
  endDate,
  goal,
}: UpdateSprintInput): Promise<UpdateSprintResult> {
  try {
    await requireRole(['Admin', 'Member']);

    const id = sprintId?.trim();
    const cleanName = name?.trim();
    const cleanStart = startDate?.trim();
    const cleanEnd = endDate?.trim();
    const cleanGoal = goal !== undefined && goal !== null ? goal.trim() || null : undefined;

    if (!id) return { success: false, error: 'Sprint ID is required.' };
    if (!cleanName) return { success: false, error: 'Sprint name cannot be empty.' };
    if (!cleanStart || !cleanEnd) return { success: false, error: 'Both start date and end date are required.' };

    const startTimestamp = new Date(cleanStart).getTime();
    const endTimestamp = new Date(cleanEnd).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return { success: false, error: 'Invalid start date or end date format.' };
    }

    if (endTimestamp <= startTimestamp) {
      return { success: false, error: 'End date must be chronologically after start date.' };
    }

    const formattedStartDate = cleanStart.includes('T') ? cleanStart.split('T')[0] : cleanStart;
    const formattedEndDate = cleanEnd.includes('T') ? cleanEnd.split('T')[0] : cleanEnd;

    const db = getDb();
    await ensureSprintTables(db);

    const existing = await db.query.sprints.findFirst({
      where: eq(sprints.id, id),
    });

    if (!existing) {
      return { success: false, error: `Sprint with ID "${id}" was not found.` };
    }

    const updateValues: {
      name: string;
      startDate: string;
      endDate: string;
      goal?: string | null;
    } = {
      name: cleanName,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };

    if (cleanGoal !== undefined) {
      updateValues.goal = cleanGoal;
    }

    await db.update(sprints).set(updateValues).where(eq(sprints.id, id));

    const updatedSprint = await db.query.sprints.findFirst({
      where: eq(sprints.id, id),
    });

    revalidatePath('/backlog');
    revalidatePath('/');

    return {
      success: true,
      message: `Sprint "${cleanName}" updated successfully.`,
      sprint: updatedSprint || undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update sprint.';
    return { success: false, error: message };
  }
}

/**
 * Create a new planned sprint sequentially.
 * Default name: "Sprint X"
 * Default start: end date of previous sprint (or today); duration: 14 days (2 weeks).
 * Status: 'PLANNED'
 */
export async function createSprintAction({
  projectId,
}: {
  projectId?: string;
}): Promise<{ success: boolean; message?: string; error?: string; sprint?: Sprint }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'Unauthenticated: Please log in.' };
    }

    if (projectId) {
      const isAuthorized = await verifyProjectAccess(currentUser.id, projectId, 'PROJECT_MANAGER');
      if (!isAuthorized) {
        return { success: false, error: 'Unauthorized: Requires Admin, CTO, or Project Manager role.' };
      }
    } else {
      await requireRole(['Admin', 'Member']);
    }

    const db = getDb();
    await ensureSprintTables(db);

    // Fetch existing sprints to determine next sequential number and date range
    const allSprints = projectId
      ? await db.all<Sprint>(sql`SELECT * FROM sprints WHERE project_id = ${projectId} OR project_id IS NULL`)
      : await db.all<Sprint>(sql`SELECT * FROM sprints`);

    let maxNum = 0;
    let latestEndDate: string | null = null;

    for (const s of allSprints) {
      const match = s.name.match(/Sprint\s+(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
      if (s.endDate) {
        const clean = s.endDate.includes('T') ? s.endDate.split('T')[0] : s.endDate;
        if (!latestEndDate || clean > latestEndDate) {
          latestEndDate = clean;
        }
      }
    }

    const nextName = maxNum > 0 ? `Sprint ${maxNum + 1}` : `Sprint ${allSprints.length + 1}`;
    const startDate = latestEndDate || new Date().toISOString().split('T')[0];
    const startObj = new Date(startDate);
    const endObj = new Date(startObj.getTime() + 14 * 24 * 60 * 60 * 1000);
    const endDate = endObj.toISOString().split('T')[0];

    const newId = `s-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    await db.run(sql`
      INSERT INTO sprints (id, name, state, status, goal, start_date, end_date, project_id, created_at)
      VALUES (
        ${newId},
        ${nextName},
        'upcoming',
        'PLANNED',
        '',
        ${startDate},
        ${endDate},
        ${projectId || 'proj-apex'},
        ${Date.now()}
      )
    `);

    const created = await db.query.sprints.findFirst({
      where: eq(sprints.id, newId),
    });

    revalidatePath('/backlog');
    revalidatePath('/board');
    revalidatePath('/');

    return {
      success: true,
      message: `Created "${nextName}" successfully.`,
      sprint: created || undefined,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create sprint.';
    return { success: false, error: message };
  }
}

/**
 * Delete a planned sprint.
 * Automatically moves all contained issues back to the Product Backlog (sprint_id = NULL).
 */
export async function deleteSprintAction({
  sprintId,
}: {
  sprintId: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated' };

    const db = getDb();
    await ensureSprintTables(db);

    const existing = await db.query.sprints.findFirst({
      where: eq(sprints.id, sprintId),
    });

    if (!existing) {
      return { success: false, error: 'Sprint not found.' };
    }

    if ((existing as any).status === 'ACTIVE' || existing.state === 'active') {
      return { success: false, error: 'Active sprints cannot be deleted. Please complete or cancel it first.' };
    }

    // 1. Move issues in this sprint back to the Product Backlog (sprint_id = NULL)
    await db.run(sql`
      UPDATE issues
      SET sprint_id = NULL, updated_at = ${Date.now()}
      WHERE sprint_id = ${sprintId}
    `);

    // 2. Delete the sprint record
    await db.run(sql`
      DELETE FROM sprints WHERE id = ${sprintId}
    `);

    revalidatePath('/backlog');
    revalidatePath('/board');
    revalidatePath('/');

    return {
      success: true,
      message: `Sprint "${existing.name}" deleted. Any assigned issues returned to Product Backlog.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete sprint.';
    return { success: false, error: message };
  }
}

/**
 * Start a sprint with single-active constraint.
 * Verifies no other sprint is currently active in the project.
 */
export async function startSprintAction({
  sprintId,
  name,
  startDate,
  endDate,
  goal,
}: {
  sprintId: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  goal?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated' };

    const db = getDb();
    await ensureSprintTables(db);

    const targetSprint = await db.query.sprints.findFirst({
      where: eq(sprints.id, sprintId),
    });

    if (!targetSprint) {
      return { success: false, error: 'Sprint not found.' };
    }

    const projectId = (targetSprint as any).project_id || 'proj-apex';

    // Single-Active Constraint: verify no other sprint is currently ACTIVE in this project
    const activeSprints = await db.all<Sprint>(sql`
      SELECT * FROM sprints
      WHERE (project_id = ${projectId} OR project_id IS NULL)
        AND (status = 'ACTIVE' OR state = 'active')
        AND id != ${sprintId}
      LIMIT 1
    `);

    if (activeSprints && activeSprints.length > 0) {
      return {
        success: false,
        error: `Sprint "${activeSprints[0].name}" is currently active. Complete it before starting a new sprint.`,
      };
    }

    const cleanName = name?.trim() || targetSprint.name;
    const cleanStart = startDate?.trim() || targetSprint.startDate || new Date().toISOString().split('T')[0];
    const cleanEnd =
      endDate?.trim() ||
      targetSprint.endDate ||
      new Date(new Date(cleanStart).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const cleanGoal = goal !== undefined ? goal.trim() : targetSprint.goal;

    await db.run(sql`
      UPDATE sprints
      SET
        name = ${cleanName},
        status = 'ACTIVE',
        state = 'active',
        start_date = ${cleanStart},
        end_date = ${cleanEnd},
        goal = ${cleanGoal || ''}
      WHERE id = ${sprintId}
    `);

    revalidatePath('/backlog');
    revalidatePath('/board');
    revalidatePath('/');

    return {
      success: true,
      message: `Sprint "${cleanName}" is now active!`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to start sprint.';
    return { success: false, error: message };
  }
}

/**
 * Complete an active sprint with rollover options.
 * Incomplete issues are moved to `rolloverTarget` (another planned sprintId or null for product backlog).
 * Completed issues stay locked to this sprint.
 * Sprint marked as 'CLOSED'.
 */
export async function completeSprintAction({
  sprintId,
  rolloverTarget,
}: {
  sprintId: string;
  rolloverTarget?: string | null;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { success: false, error: 'Unauthenticated' };

    const db = getDb();
    await ensureSprintTables(db);

    const sprint = await db.query.sprints.findFirst({
      where: eq(sprints.id, sprintId),
    });

    if (!sprint) {
      return { success: false, error: 'Sprint not found.' };
    }

    // Move incomplete issues (status NOT 'Done' and NOT 'Shipped')
    if (rolloverTarget && rolloverTarget !== 'backlog') {
      await db.run(sql`
        UPDATE issues
        SET sprint_id = ${rolloverTarget}, updated_at = ${Date.now()}
        WHERE sprint_id = ${sprintId} AND status NOT IN ('Done', 'Shipped')
      `);
    } else {
      // Move to Product Backlog
      await db.run(sql`
        UPDATE issues
        SET sprint_id = NULL, updated_at = ${Date.now()}
        WHERE sprint_id = ${sprintId} AND status NOT IN ('Done', 'Shipped')
      `);
    }

    // Close the sprint and record completed_at
    const nowMs = Date.now();
    await db.run(sql`
      UPDATE sprints
      SET status = 'CLOSED', state = 'closed', completed_at = ${nowMs}
      WHERE id = ${sprintId}
    `);

    revalidatePath('/backlog');
    revalidatePath('/board');
    revalidatePath('/');

    return {
      success: true,
      message: `Sprint "${sprint.name}" completed successfully.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to complete sprint.';
    return { success: false, error: message };
  }
}

/**
 * Move an issue to a different sprint or back to product backlog (sprintId = null).
 */
export async function moveIssueSprintAction({
  issueKey,
  sprintId,
}: {
  issueKey: string;
  sprintId: string | null;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const db = getDb();
    await ensureSprintTables(db);

    await db.run(sql`
      UPDATE issues
      SET sprint_id = ${sprintId || null}, updated_at = ${Date.now()}
      WHERE key = ${issueKey}
    `);

    revalidatePath('/backlog');
    revalidatePath('/board');
    revalidatePath('/');

    return { success: true, message: 'Issue moved successfully.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to move issue.';
    return { success: false, error: message };
  }
}

/**
 * Fetch the currently ACTIVE sprint for a project.
 */
export async function getActiveSprintAction(projectId?: string): Promise<Sprint | null> {
  try {
    const db = getDb();
    await ensureSprintTables(db);

    const activeList = projectId
      ? await db.all<Sprint>(sql`
          SELECT * FROM sprints
          WHERE (project_id = ${projectId} OR project_id IS NULL)
            AND (status = 'ACTIVE' OR state = 'active')
          ORDER BY start_date ASC
          LIMIT 1
        `)
      : await db.all<Sprint>(sql`
          SELECT * FROM sprints
          WHERE (status = 'ACTIVE' OR state = 'active')
          ORDER BY start_date ASC
          LIMIT 1
        `);

    return activeList[0] || null;
  } catch {
    return null;
  }
}

/**
 * Fetch all sprints for a project.
 */
export async function getProjectSprintsAction(projectId?: string): Promise<Sprint[]> {
  try {
    const db = getDb();
    await ensureSprintTables(db);

    const all = projectId
      ? await db.all<Sprint>(sql`
          SELECT * FROM sprints
          WHERE project_id = ${projectId} OR project_id IS NULL
          ORDER BY created_at ASC
        `)
      : await db.all<Sprint>(sql`
          SELECT * FROM sprints
          ORDER BY created_at ASC
        `);

    return all;
  } catch {
    return [];
  }
}
