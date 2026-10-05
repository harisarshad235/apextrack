'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole, getCurrentUser } from '@/lib/auth';
import {
  issues,
  comments,
  issueHistory,
  labels,
  issueLabels,
  projectCounters,
  projects,
  IssueStatus,
  IssueType,
  IssuePriority,
} from '@/db/schema';

export async function moveIssueStatus(issueKey: string, newStatus: string) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();

    const existing = await db.query.issues.findFirst({
      where: eq(issues.key, issueKey),
    });

    if (!existing) {
      return { success: false, error: 'Issue not found.' };
    }

    if (existing.status === newStatus) {
      return { success: true };
    }

    const oldStatus = existing.status;

    // Atomically update issue status & insert audit history entry
    await db.batch([
      db
        .update(issues)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(issues.key, issueKey)),
      db.insert(issueHistory).values({
        id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        issueKey,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: `Changed status from "${oldStatus}" to "${newStatus}"`,
        field: 'status',
        fromValue: oldStatus,
        toValue: newStatus,
      }),
    ]);

    revalidatePath('/');
    return { success: true, message: `Moved ${issueKey} to ${newStatus}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to move issue status';
    return { success: false, error: message };
  }
}

export async function createIssue(data: {
  projectId?: string;
  title: string;
  type: IssueType;
  priority: IssuePriority;
  status?: string;
  assigneeId?: string;
  storyPoints?: number;
  sprintId?: string;
  dueDate?: string;
  labelsList?: string[];
  description?: string;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();

    // 1. Determine target project and key prefix
    let targetProject = null;
    if (data.projectId) {
      targetProject = await db.query.projects.findFirst({
        where: eq(projects.id, data.projectId),
      });
    }

    if (!targetProject) {
      targetProject = await db.query.projects.findFirst();
    }

    const projectKey = targetProject ? targetProject.key : (process.env.PROJECT_KEY || 'APEX');
    const projectId = targetProject ? targetProject.id : null;

    // 2. Atomic key generation (e.g. APEX-### or CORE-###)
    let counter = await db.query.projectCounters.findFirst({
      where: eq(projectCounters.projectKey, projectKey),
    });

    if (!counter) {
      await db
        .insert(projectCounters)
        .values({ projectKey, nextSeq: 101 });
      counter = { projectKey, nextSeq: 101 };
    }

    const issueNum = counter.nextSeq;
    const key = `${projectKey}-${issueNum}`;

    // Increment counter for next issue
    await db
      .update(projectCounters)
      .set({ nextSeq: issueNum + 1 })
      .where(eq(projectCounters.projectKey, projectKey));

    // Insert Issue
    await db.insert(issues).values({
      key,
      projectId,
      title: data.title.trim(),
      type: data.type,
      priority: data.priority,
      status: data.status?.trim() || 'To Do',
      assigneeId: data.assigneeId || currentUser.id,
      reporterId: currentUser.id,
      sprintId: data.sprintId === 'Backlog' || !data.sprintId ? null : data.sprintId,
      storyPoints: Number(data.storyPoints) || 0,
      dueDate: data.dueDate || null,
      description: data.description?.trim() || '',
    });

    // Handle labels
    if (data.labelsList && data.labelsList.length > 0) {
      for (const labelName of data.labelsList) {
        const cleanName = labelName.trim();
        if (!cleanName) continue;

        let labelObj = await db.query.labels.findFirst({
          where: eq(labels.name, cleanName),
        });

        if (!labelObj) {
          const res = await db.insert(labels).values({ name: cleanName }).returning();
          labelObj = res[0];
        }

        if (labelObj) {
          await db
            .insert(issueLabels)
            .values({ issueKey: key, labelId: labelObj.id })
            .onConflictDoNothing();
        }
      }
    }

    // Record creation in history
    await db.insert(issueHistory).values({
      id: `h-${Date.now()}`,
      issueKey: key,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'Created issue',
    });

    revalidatePath('/');
    return { success: true, key, message: `Created issue ${key}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create issue';
    return { success: false, error: message };
  }
}

export async function updateIssue(
  issueKey: string,
  data: {
    title?: string;
    description?: string;
    priority?: IssuePriority;
    type?: IssueType;
    status?: string;
    projectId?: string;
    assigneeId?: string | null;
    storyPoints?: number;
    sprintId?: string | null;
  }
) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();

    const existing = await db.query.issues.findFirst({
      where: eq(issues.key, issueKey),
    });

    if (!existing) return { success: false, error: 'Issue not found' };

    await db
      .update(issues)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(issues.key, issueKey));

    await db.insert(issueHistory).values({
      id: `h-${Date.now()}`,
      issueKey,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'Updated issue details',
    });

    revalidatePath('/');
    return { success: true, message: `Updated issue ${issueKey}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update issue';
    return { success: false, error: message };
  }
}

export async function deleteIssue(issueKey: string) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();

    await db.delete(issues).where(eq(issues.key, issueKey));

    revalidatePath('/');
    return { success: true, message: `Deleted issue ${issueKey}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete issue';
    return { success: false, error: message };
  }
}

export async function addComment(issueKey: string, body: string) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    if (!body.trim()) return { success: false, error: 'Comment body cannot be empty' };

    const db = getDb();
    const commentId = `c-${Date.now()}`;

    await db.insert(comments).values({
      id: commentId,
      issueKey,
      authorId: currentUser.id,
      body: body.trim(),
    });

    revalidatePath('/');
    return { success: true, message: 'Comment saved' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add comment';
    return { success: false, error: message };
  }
}
