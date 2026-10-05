'use server';

import { revalidatePath } from 'next/cache';
import { eq, desc } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { projects, swimlanes, projectCounters, ProjectStatus } from '@/db/schema';

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

    // 1. Create project
    await db.insert(projects).values({
      id: projectId,
      key: cleanKey,
      name: cleanName,
      description: data.description?.trim() || '',
      category: data.category?.trim() || 'Software',
      leadId: data.leadId || currentUser.id,
      status: 'active',
    });

    // 2. Initialize project issue key counter
    await db.insert(projectCounters).values({
      projectKey: cleanKey,
      nextSeq: 101,
    }).onConflictDoNothing();

    // 3. Create initial 4 default swimlanes for this project
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
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
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

    revalidatePath('/');
    return { success: true, message: `Archived project ${existing.name}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to archive project';
    return { success: false, error: message };
  }
}
