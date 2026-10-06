'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, desc, max, inArray } from 'drizzle-orm';
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
  users,
  subtasks,
  issueLinks,
  notifications,
  IssueStatus,
  IssueType,
  IssuePriority,
  LinkType,
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

    // @mention parsing -> notifications
    const tokens = Array.from(body.matchAll(/@([\w.-]+)/g)).map((m) => m[1].toLowerCase().replace(/[.-]+$/, ''));
    if (tokens.length > 0) {
      const allUsers = await db.select().from(users);
      const mentioned = new Map<string, string>();
      for (const u of allUsers) {
        if (u.id === currentUser.id) continue;
        const full = u.name.toLowerCase().replace(/\s+/g, '');
        const dotted = u.name.toLowerCase().replace(/\s+/g, '.');
        const first = u.name.toLowerCase().split(/\s+/)[0];
        const emailLocal = u.email.toLowerCase().split('@')[0];
        if (tokens.some((t) => t === full || t === dotted || t === first || t === emailLocal)) {
          mentioned.set(u.id, u.name);
        }
      }
      if (mentioned.size > 0) {
        const now = new Date().toISOString();
        await db.insert(notifications).values(
          Array.from(mentioned.keys()).map((userId) => ({
            id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId,
            authorId: currentUser.id,
            issueId: issueKey,
            message: `${currentUser.name} mentioned you in ${issueKey}: "${body.trim().slice(0, 100)}"`,
            read: false,
            createdAt: now,
          }))
        );
      }
    }

    revalidatePath('/');
    return { success: true, message: 'Comment saved' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add comment';
    return { success: false, error: message };
  }
}

/* ---------------------------- Flags ---------------------------- */
export async function toggleIssueFlag(issueKey: string) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    const existing = await db.query.issues.findFirst({ where: eq(issues.key, issueKey) });
    if (!existing) return { success: false, error: 'Issue not found' };

    const next = !existing.isFlagged;
    await db.batch([
      db.update(issues).set({ isFlagged: next, updatedAt: new Date() }).where(eq(issues.key, issueKey)),
      db.insert(issueHistory).values({
        id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        issueKey,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: next ? 'Flagged issue as impediment' : 'Removed impediment flag',
        field: 'isFlagged',
        fromValue: String(!next),
        toValue: String(next),
      }),
    ]);
    revalidatePath('/');
    return { success: true, flagged: next };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to toggle flag' };
  }
}

/* --------------------------- Subtasks --------------------------- */
export async function addSubtask(issueKey: string, title: string) {
  try {
    await requireRole(['Admin', 'Member']);
    const clean = title.trim();
    if (!clean) return { success: false, error: 'Subtask title required' };
    const db = getDb();
    const [row] = await db
      .select({ m: max(subtasks.sortOrder) })
      .from(subtasks)
      .where(eq(subtasks.issueId, issueKey));
    const id = `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(subtasks).values({
      id,
      issueId: issueKey,
      title: clean,
      sortOrder: (row?.m ?? -1) + 1,
    });
    revalidatePath('/');
    return { success: true, id };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to add subtask' };
  }
}

export async function toggleSubtask(subtaskId: string, completed: boolean) {
  try {
    await requireRole(['Admin', 'Member']);
    await getDb().update(subtasks).set({ completed }).where(eq(subtasks.id, subtaskId));
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update subtask' };
  }
}

export async function deleteSubtask(subtaskId: string) {
  try {
    await requireRole(['Admin', 'Member']);
    await getDb().delete(subtasks).where(eq(subtasks.id, subtaskId));
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete subtask' };
  }
}

/* ------------------------- Issue Links ------------------------- */
export async function addIssueLink(sourceKey: string, targetKey: string, relationType: LinkType) {
  try {
    await requireRole(['Admin', 'Member']);
    const target = targetKey.trim().toUpperCase();
    if (target === sourceKey) return { success: false, error: 'Cannot link an issue to itself' };
    const db = getDb();
    const targetIssue = await db.query.issues.findFirst({ where: eq(issues.key, target) });
    if (!targetIssue) return { success: false, error: `Issue ${target} not found` };

    const dup = await db
      .select()
      .from(issueLinks)
      .where(
        and(
          eq(issueLinks.sourceIssueId, sourceKey),
          eq(issueLinks.targetIssueId, target),
          eq(issueLinks.relationType, relationType)
        )
      );
    if (dup.length > 0) return { success: false, error: 'Link already exists' };

    await db.insert(issueLinks).values({
      id: `l-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceIssueId: sourceKey,
      targetIssueId: target,
      relationType,
    });
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to link issue' };
  }
}

export async function removeIssueLink(linkId: string) {
  try {
    await requireRole(['Admin', 'Member']);
    await getDb().delete(issueLinks).where(eq(issueLinks.id, linkId));
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove link' };
  }
}

/* ------------------------- Notifications ------------------------- */
export async function getMyNotifications() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false as const, notifications: [] };
    const rows = await getDb()
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
    return { success: true as const, notifications: rows };
  } catch {
    return { success: false as const, notifications: [] };
  }
}

export async function markNotificationsRead(ids?: string[]) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false };
    const db = getDb();
    const unread = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.read, false)));
    const targets = unread.filter((n) => !ids || ids.includes(n.id));
    if (targets.length > 0) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(inArray(notifications.id, targets.map((n) => n.id)));
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}
