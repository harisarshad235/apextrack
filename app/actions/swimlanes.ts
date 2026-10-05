'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, asc } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { swimlanes, issues } from '@/db/schema';

export async function createSwimlane(data: {
  projectId: string;
  name: string;
  color?: string;
}) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();

    const cleanName = data.name.trim();
    if (!cleanName) {
      return { success: false, error: 'Swimlane name cannot be empty.' };
    }

    // Get current lanes for this project to calculate sortOrder
    const currentLanes = await db
      .select()
      .from(swimlanes)
      .where(eq(swimlanes.projectId, data.projectId))
      .orderBy(asc(swimlanes.sortOrder));

    const existingWithName = currentLanes.find(
      (l) => l.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingWithName) {
      return { success: false, error: `A swimlane named "${cleanName}" already exists in this project.` };
    }

    const nextOrder = currentLanes.length;
    const laneId = `lane-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Default pleasant border/bg colors
    const color =
      data.color ||
      'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50';

    await db.insert(swimlanes).values({
      id: laneId,
      projectId: data.projectId,
      name: cleanName,
      statusKey: cleanName,
      color,
      sortOrder: nextOrder,
    });

    revalidatePath('/');
    return { success: true, laneId, message: `Created swimlane "${cleanName}"` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create swimlane';
    return { success: false, error: message };
  }
}

export async function updateSwimlane(
  swimlaneId: string,
  data: {
    name?: string;
    color?: string;
    sortOrder?: number;
  }
) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();

    const existing = await db.query.swimlanes.findFirst({
      where: eq(swimlanes.id, swimlaneId),
    });

    if (!existing) {
      return { success: false, error: 'Swimlane not found.' };
    }

    const updateData: {
      name?: string;
      statusKey?: string;
      color?: string;
      sortOrder?: number;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined && data.name.trim()) {
      const newName = data.name.trim();
      updateData.name = newName;
      updateData.statusKey = newName;

      // Migrate existing issues in this swimlane to the new status name
      const oldStatus = existing.name;
      if (oldStatus !== newName) {
        await db
          .update(issues)
          .set({ status: newName, updatedAt: new Date() })
          .where(
            and(
              eq(issues.projectId, existing.projectId),
              eq(issues.status, oldStatus)
            )
          );
      }
    }

    if (data.color !== undefined) {
      updateData.color = data.color;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    await db.update(swimlanes).set(updateData).where(eq(swimlanes.id, swimlaneId));

    revalidatePath('/');
    return { success: true, message: 'Swimlane updated' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update swimlane';
    return { success: false, error: message };
  }
}

export async function deleteSwimlane(swimlaneId: string) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();

    const target = await db.query.swimlanes.findFirst({
      where: eq(swimlanes.id, swimlaneId),
    });

    if (!target) {
      return { success: false, error: 'Swimlane not found.' };
    }

    // Find other swimlanes in this project
    const otherLanes = await db
      .select()
      .from(swimlanes)
      .where(eq(swimlanes.projectId, target.projectId));

    if (otherLanes.length <= 1) {
      return {
        success: false,
        error: 'Cannot delete the only swimlane in a project. Board must have at least one lane.',
      };
    }

    const fallbackLane = otherLanes.find((l) => l.id !== target.id)!;

    // Migrate any issues in this deleted swimlane to fallback lane
    await db
      .update(issues)
      .set({ status: fallbackLane.name, updatedAt: new Date() })
      .where(
        and(
          eq(issues.projectId, target.projectId),
          eq(issues.status, target.name)
        )
      );

    await db.delete(swimlanes).where(eq(swimlanes.id, swimlaneId));

    revalidatePath('/');
    return { success: true, message: `Deleted swimlane "${target.name}"` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete swimlane';
    return { success: false, error: message };
  }
}
