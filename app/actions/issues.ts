'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, desc, max, inArray, or } from 'drizzle-orm';
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
  issueComments,
  issueAuditLogs,
  notifications,
  IssueStatus,
  IssueType,
  IssuePriority,
  LinkType,
  EnterpriseLinkType,
} from '@/db/schema';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';

/**
 * Validates enterprise issue hierarchy rules:
 * - Epics cannot have a parent.
 * - Stories, Tasks, and Bugs can only belong to an Epic.
 * - Subtasks can only belong to a Story, Task, or Bug (never directly to an Epic, and Subtasks cannot have subtasks).
 */
export async function validateIssueHierarchy(
  db: ReturnType<typeof getDb>,
  type: string,
  parentIssueId?: string | null
) {
  const normType = (type || 'TASK').toUpperCase();
  if (normType === 'EPIC') {
    if (parentIssueId) {
      throw new Error('Epics cannot have a parent issue.');
    }
    return;
  }

  if (!parentIssueId) return;

  const parent = await db.query.issues.findFirst({
    where: eq(issues.key, parentIssueId),
  });

  if (!parent) {
    throw new Error(`Parent issue "${parentIssueId}" not found.`);
  }

  const parentType = (parent.issueType || parent.type || 'TASK').toUpperCase();

  if (normType === 'SUBTASK') {
    if (parentType === 'EPIC') {
      throw new Error('Subtasks cannot belong directly to an Epic. They must belong to a Story, Task, or Bug.');
    }
    if (parentType === 'SUBTASK') {
      throw new Error('Subtasks cannot have subtasks.');
    }
  } else if (['STORY', 'TASK', 'BUG'].includes(normType)) {
    if (parentType !== 'EPIC') {
      throw new Error('Stories, Tasks, and Bugs can only belong to an Epic.');
    }
  }
}

/**
 * Appends an immutable audit log record to issue_audit_logs.
 */
export async function logIssueAudit(
  db: ReturnType<typeof getDb>,
  params: {
    issueId: string;
    actorId: string;
    fieldChanged: string;
    oldValue?: string | number | null;
    newValue?: string | number | null;
  }
) {
  try {
    await db.insert(issueAuditLogs).values({
      id: `al-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      issueId: params.issueId,
      actorId: params.actorId,
      fieldChanged: params.fieldChanged,
      oldValue: params.oldValue != null ? String(params.oldValue) : null,
      newValue: params.newValue != null ? String(params.newValue) : null,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('Failed to log issue audit:', err);
  }
}

export async function moveIssueStatus(issueKey: string, newStatus: string) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

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

    await logIssueAudit(db, {
      issueId: issueKey,
      actorId: currentUser.id,
      fieldChanged: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
    });

    revalidatePath('/');
    return { success: true, message: `Moved ${issueKey} to ${newStatus}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to move issue status';
    return { success: false, error: message };
  }
}

export async function createIssue(data: {
  projectId?: string;
  parentIssueId?: string | null;
  title: string;
  type?: IssueType;
  issueType?: string;
  epicColor?: string;
  priority: IssuePriority;
  status?: string;
  assigneeId?: string | null;
  storyPoints?: number;
  originalEstimateHours?: number | null;
  remainingEstimateHours?: number | null;
  sprintId?: string | null;
  dueDate?: string;
  labelsList?: string[];
  description?: string;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const resolvedType = (data.issueType || data.type || 'TASK').toUpperCase();
    await validateIssueHierarchy(db, resolvedType, data.parentIssueId);

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

    // Map UI type
    const legacyType: IssueType =
      resolvedType === 'EPIC' ? 'Epic' :
      resolvedType === 'STORY' ? 'Story' :
      resolvedType === 'BUG' ? 'Bug' :
      resolvedType === 'SUBTASK' ? 'Subtask' : 'Task';

    // Insert Issue
    await db.insert(issues).values({
      key,
      projectId,
      parentIssueId: data.parentIssueId || null,
      title: data.title.trim(),
      type: legacyType,
      issueType: resolvedType,
      epicColor: data.epicColor || (resolvedType === 'EPIC' ? '#3B82F6' : undefined),
      priority: data.priority,
      status: data.status?.trim() || 'To Do',
      assigneeId: data.assigneeId || currentUser.id,
      reporterId: currentUser.id,
      sprintId: data.sprintId === 'Backlog' || !data.sprintId ? null : data.sprintId,
      storyPoints: data.storyPoints != null ? Number(data.storyPoints) : 0,
      originalEstimateHours: data.originalEstimateHours != null ? Number(data.originalEstimateHours) : null,
      remainingEstimateHours: data.remainingEstimateHours != null ? Number(data.remainingEstimateHours) : (data.originalEstimateHours != null ? Number(data.originalEstimateHours) : null),
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

    // Record creation in history & audit log
    await db.insert(issueHistory).values({
      id: `h-${Date.now()}`,
      issueKey: key,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'Created issue',
    });

    await logIssueAudit(db, {
      issueId: key,
      actorId: currentUser.id,
      fieldChanged: 'created',
      oldValue: null,
      newValue: resolvedType,
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
    issueType?: string;
    epicColor?: string;
    status?: string;
    projectId?: string;
    parentIssueId?: string | null;
    assigneeId?: string | null;
    storyPoints?: number | null;
    originalEstimateHours?: number | null;
    remainingEstimateHours?: number | null;
    sprintId?: string | null;
    dueDate?: string | null;
  }
) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const existing = await db.query.issues.findFirst({
      where: eq(issues.key, issueKey),
    });

    if (!existing) return { success: false, error: 'Issue not found' };

    const effectiveType = (data.issueType || data.type || existing.issueType || existing.type).toUpperCase();
    const effectiveParent = data.parentIssueId !== undefined ? data.parentIssueId : existing.parentIssueId;

    if (data.issueType !== undefined || data.type !== undefined || data.parentIssueId !== undefined) {
      await validateIssueHierarchy(db, effectiveType, effectiveParent);
    }

    // Prepare update payload
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date(),
    };

    if (data.issueType) {
      updatePayload.issueType = data.issueType.toUpperCase();
    }

    await db
      .update(issues)
      .set(updatePayload)
      .where(eq(issues.key, issueKey));

    // Audit logs for critical fields changed
    const auditFields: Array<{ key: keyof typeof data; label: string }> = [
      { key: 'status', label: 'status' },
      { key: 'assigneeId', label: 'assignee' },
      { key: 'priority', label: 'priority' },
      { key: 'storyPoints', label: 'story_points' },
      { key: 'originalEstimateHours', label: 'original_estimate' },
      { key: 'remainingEstimateHours', label: 'remaining_estimate' },
      { key: 'parentIssueId', label: 'parent_issue' },
      { key: 'issueType', label: 'issue_type' },
    ];

    for (const field of auditFields) {
      if (data[field.key] !== undefined && (existing as any)[field.key] !== data[field.key]) {
        await logIssueAudit(db, {
          issueId: issueKey,
          actorId: currentUser.id,
          fieldChanged: field.label,
          oldValue: (existing as any)[field.key],
          newValue: data[field.key] as any,
        });
      }
    }

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
    await ensureEnterpriseSchema(db);

    // Safely unlink or reparent children without orphaned subtask errors
    await db
      .update(issues)
      .set({ parentIssueId: null })
      .where(eq(issues.parentIssueId, issueKey));

    // Remove issue links where this issue is source or target
    await db
      .delete(issueLinks)
      .where(or(eq(issueLinks.sourceIssueId, issueKey), eq(issueLinks.targetIssueId, issueKey)));

    await db.delete(issues).where(eq(issues.key, issueKey));

    revalidatePath('/');
    return { success: true, message: `Deleted issue ${issueKey}` };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete issue';
    return { success: false, error: message };
  }
}

export async function addComment(issueKey: string, body: string) {
  const { addCommentAction } = await import('@/app/actions/comments');
  return addCommentAction(issueKey, body);
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

/* ------------------------- Issue Links & Relationships ------------------------- */

/**
 * Enterprise linkIssuesAction:
 * - Direct self-link check
 * - Symmetrical auto-linking (e.g. A BLOCKS B <=> B IS_BLOCKED_BY A)
 * - Cycle detection for blocker relationships (prevents A blocks B and B blocks A, transitive cycles)
 * - Audit logging
 */
export async function linkIssuesAction(params: {
  sourceIssueId: string;
  targetIssueId: string;
  linkType: EnterpriseLinkType | LinkType;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const source = params.sourceIssueId.trim().toUpperCase();
    const target = params.targetIssueId.trim().toUpperCase();
    const rawType = params.linkType.toUpperCase();

    if (source === target) {
      return { success: false, error: 'Cannot link an issue to itself.' };
    }

    const [srcIssue, tgtIssue] = await Promise.all([
      db.query.issues.findFirst({ where: eq(issues.key, source) }),
      db.query.issues.findFirst({ where: eq(issues.key, target) }),
    ]);

    if (!srcIssue) return { success: false, error: `Source issue ${source} not found.` };
    if (!tgtIssue) return { success: false, error: `Target issue ${target} not found.` };

    let forwardType: EnterpriseLinkType = 'RELATES_TO';
    let reverseType: EnterpriseLinkType = 'RELATES_TO';

    if (rawType === 'BLOCKS') {
      forwardType = 'BLOCKS';
      reverseType = 'IS_BLOCKED_BY';
    } else if (rawType === 'IS_BLOCKED_BY') {
      forwardType = 'IS_BLOCKED_BY';
      reverseType = 'BLOCKS';
    } else if (rawType === 'DUPLICATES') {
      forwardType = 'DUPLICATES';
      reverseType = 'DUPLICATES';
    } else {
      forwardType = 'RELATES_TO';
      reverseType = 'RELATES_TO';
    }

    // Circular Dependency Detection for Blocker Chains
    // Identify who would be the blocker and who is blocked
    const intendedBlocker = forwardType === 'BLOCKS' ? source : forwardType === 'IS_BLOCKED_BY' ? target : null;
    const intendedBlocked = forwardType === 'BLOCKS' ? target : forwardType === 'IS_BLOCKED_BY' ? source : null;

    if (intendedBlocker && intendedBlocked) {
      if (intendedBlocker === intendedBlocked) {
        return { success: false, error: 'Circular dependency: An issue cannot block itself.' };
      }

      // Build graph of existing blocker edges: u -> v means u BLOCKS v
      const allLinks = await db.select().from(issueLinks);
      const adj = new Map<string, string[]>();

      for (const link of allLinks) {
        const lType = (link.linkType || link.relationType || '').toUpperCase();
        if (lType === 'BLOCKS') {
          const list = adj.get(link.sourceIssueId) || [];
          list.push(link.targetIssueId);
          adj.set(link.sourceIssueId, list);
        } else if (lType === 'IS_BLOCKED_BY') {
          // source is blocked by target -> target blocks source
          const list = adj.get(link.targetIssueId) || [];
          list.push(link.sourceIssueId);
          adj.set(link.targetIssueId, list);
        }
      }

      // Check if intendedBlocked can already reach intendedBlocker
      // If intendedBlocked already blocks intendedBlocker (or transitively through others), adding this link would create a cycle!
      const visited = new Set<string>();
      const queue = [intendedBlocked];
      let createsCycle = false;

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr === intendedBlocker) {
          createsCycle = true;
          break;
        }
        if (!visited.has(curr)) {
          visited.add(curr);
          const neighbors = adj.get(curr) || [];
          for (const n of neighbors) {
            if (!visited.has(n)) queue.push(n);
          }
        }
      }

      if (createsCycle) {
        return {
          success: false,
          error: `Circular dependency detected: Issue ${intendedBlocked} already transitively blocks ${intendedBlocker}.`,
        };
      }
    }

    // Check duplicate
    const existing = await db
      .select()
      .from(issueLinks)
      .where(
        and(
          eq(issueLinks.sourceIssueId, source),
          eq(issueLinks.targetIssueId, target),
          or(eq(issueLinks.linkType, forwardType), eq(issueLinks.relationType, forwardType.toLowerCase() as LinkType))
        )
      );

    if (existing.length > 0) {
      return { success: false, error: 'Link already exists between these issues.' };
    }

    const id1 = `l-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const id2 = `l-${Date.now() + 1}-${Math.random().toString(36).substring(2, 6)}`;

    // Insert forward link
    await db.insert(issueLinks).values({
      id: id1,
      sourceIssueId: source,
      targetIssueId: target,
      linkType: forwardType,
      relationType: forwardType.toLowerCase() as LinkType,
    });

    // Insert reciprocal link if applicable
    if (forwardType !== 'DUPLICATES') {
      await db.insert(issueLinks).values({
        id: id2,
        sourceIssueId: target,
        targetIssueId: source,
        linkType: reverseType,
        relationType: reverseType.toLowerCase() as LinkType,
      }).onConflictDoNothing();
    }

    // Log to audit trail
    await logIssueAudit(db, {
      issueId: source,
      actorId: currentUser.id,
      fieldChanged: 'issue_link',
      oldValue: null,
      newValue: `${forwardType} ${target}`,
    });

    revalidatePath('/');
    return { success: true, message: `Linked ${source} ${forwardType} ${target}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to link issues.' };
  }
}

export async function addIssueLink(sourceKey: string, targetKey: string, relationType: LinkType) {
  return linkIssuesAction({
    sourceIssueId: sourceKey,
    targetIssueId: targetKey,
    linkType: relationType.toUpperCase() as EnterpriseLinkType,
  });
}

export async function unlinkIssuesAction(params: {
  linkId?: string;
  sourceIssueId?: string;
  targetIssueId?: string;
}) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    if (params.linkId) {
      const link = await db.query.issueLinks.findFirst({
        where: eq(issueLinks.id, params.linkId),
      });
      if (link) {
        await db.delete(issueLinks).where(
          or(
            eq(issueLinks.id, params.linkId),
            and(
              eq(issueLinks.sourceIssueId, link.targetIssueId),
              eq(issueLinks.targetIssueId, link.sourceIssueId)
            )
          )
        );
      }
    } else if (params.sourceIssueId && params.targetIssueId) {
      await db.delete(issueLinks).where(
        or(
          and(
            eq(issueLinks.sourceIssueId, params.sourceIssueId),
            eq(issueLinks.targetIssueId, params.targetIssueId)
          ),
          and(
            eq(issueLinks.sourceIssueId, params.targetIssueId),
            eq(issueLinks.targetIssueId, params.sourceIssueId)
          )
        )
      );
    }

    revalidatePath('/');
    return { success: true, message: 'Link removed successfully.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to remove link.' };
  }
}

export async function removeIssueLink(linkId: string) {
  return unlinkIssuesAction({ linkId });
}

/* ------------------------- Time Tracking / Work Log ------------------------- */
export async function logWorkAction(params: {
  issueKey: string;
  hoursSpent: number;
  remainingHours?: number | null;
  comment?: string;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const existing = await db.query.issues.findFirst({
      where: eq(issues.key, params.issueKey),
    });

    if (!existing) return { success: false, error: 'Issue not found' };

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (params.remainingHours !== undefined && params.remainingHours !== null) {
      updates.remainingEstimateHours = Math.max(0, Number(params.remainingHours));
    }

    await db.update(issues).set(updates).where(eq(issues.key, params.issueKey));

    // Audit log
    await logIssueAudit(db, {
      issueId: params.issueKey,
      actorId: currentUser.id,
      fieldChanged: 'work_logged',
      oldValue: `${existing.remainingEstimateHours ?? 0}h remaining`,
      newValue: `Logged ${params.hoursSpent}h (${params.remainingHours ?? existing.remainingEstimateHours ?? 0}h remaining)`,
    });

    // If comment provided, insert into comments
    if (params.comment && params.comment.trim()) {
      await db.insert(comments).values({
        id: `c-wl-${Date.now()}`,
        issueKey: params.issueKey,
        authorId: currentUser.id,
        body: `**Logged Work (${params.hoursSpent}h):** ${params.comment.trim()}`,
      });
    }

    revalidatePath('/');
    return { success: true, message: `Logged ${params.hoursSpent} hours on ${params.issueKey}` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to log work.' };
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
