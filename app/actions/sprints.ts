'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { sprints, Sprint } from '@/db/schema';

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
 * Validates role permissions, input presence, and chronological order of dates.
 * Persists updates to Cloudflare D1 `sprints` table and revalidates backlog & workspace routes.
 */
export async function updateSprintAction({
  sprintId,
  name,
  startDate,
  endDate,
  goal,
}: UpdateSprintInput): Promise<UpdateSprintResult> {
  try {
    // 1. RBAC authorization: Project leads / Admins / Members have write permissions
    await requireRole(['Admin', 'Member']);

    const id = sprintId?.trim();
    const cleanName = name?.trim();
    const cleanStart = startDate?.trim();
    const cleanEnd = endDate?.trim();
    const cleanGoal = goal !== undefined && goal !== null ? goal.trim() || null : undefined;

    // 2. Validate required fields
    if (!id) {
      return { success: false, error: 'Sprint ID is required.' };
    }

    if (!cleanName) {
      return { success: false, error: 'Sprint name cannot be empty.' };
    }

    if (!cleanStart || !cleanEnd) {
      return { success: false, error: 'Both start date and end date are required.' };
    }

    // 3. Chronological date validation: endDate must be chronologically after startDate
    const startTimestamp = new Date(cleanStart).getTime();
    const endTimestamp = new Date(cleanEnd).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return { success: false, error: 'Invalid start date or end date format.' };
    }

    if (endTimestamp <= startTimestamp) {
      return { success: false, error: 'End date must be chronologically after start date.' };
    }

    // Extract ISO YYYY-MM-DD format
    const formattedStartDate = cleanStart.includes('T') ? cleanStart.split('T')[0] : cleanStart;
    const formattedEndDate = cleanEnd.includes('T') ? cleanEnd.split('T')[0] : cleanEnd;

    // 4. Verify sprint exists in Cloudflare D1
    const db = getDb();
    const existing = await db.query.sprints.findFirst({
      where: eq(sprints.id, id),
    });

    if (!existing) {
      return { success: false, error: `Sprint with ID "${id}" was not found.` };
    }

    // 5. Persist updates to D1 sprints table
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

    await db
      .update(sprints)
      .set(updateValues)
      .where(eq(sprints.id, id));

    // 6. Fetch updated sprint for returning to client
    const updatedSprint = await db.query.sprints.findFirst({
      where: eq(sprints.id, id),
    });

    // 7. Revalidate backlog route and root workspace
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
