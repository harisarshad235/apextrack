'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, asc, sql, or } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { verifyProjectAccess } from '@/lib/rbac';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import {
  issues,
  subtasks,
  issueLinks,
  comments,
  issueHistory,
  projectWorkflowStatuses,
  workflowTransitionRules,
  WorkflowCategory,
} from '@/db/schema';
import { logIssueAudit } from './issues';

export async function getProjectWorkflowStatusesAction(projectId: string) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const statuses = await db
      .select()
      .from(projectWorkflowStatuses)
      .where(eq(projectWorkflowStatuses.projectId, projectId))
      .orderBy(asc(projectWorkflowStatuses.position));

    return { success: true, statuses };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch statuses', statuses: [] };
  }
}

export async function createWorkflowStatusAction(params: {
  projectId: string;
  name: string;
  category?: WorkflowCategory;
  wipLimit?: number;
  isInitial?: boolean;
  isFinal?: boolean;
}) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const existing = await db
      .select()
      .from(projectWorkflowStatuses)
      .where(eq(projectWorkflowStatuses.projectId, params.projectId));

    const id = `ws-${params.projectId}-${Date.now().toString(36)}`;
    const position = existing.length;

    await db.insert(projectWorkflowStatuses).values({
      id,
      projectId: params.projectId,
      name: params.name.trim(),
      category: params.category || 'IN_PROGRESS',
      position,
      wipLimit: params.wipLimit ?? 0,
      isInitial: params.isInitial ?? false,
      isFinal: params.isFinal ?? false,
    });

    revalidatePath('/');
    return { success: true, id, message: `Created workflow status "${params.name}"` };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to create status' };
  }
}

export async function updateWorkflowStatusAction(
  statusId: string,
  params: {
    name?: string;
    category?: WorkflowCategory;
    wipLimit?: number;
    position?: number;
    isInitial?: boolean;
    isFinal?: boolean;
  }
) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    await db
      .update(projectWorkflowStatuses)
      .set(params)
      .where(eq(projectWorkflowStatuses.id, statusId));

    revalidatePath('/');
    return { success: true, message: 'Workflow status updated.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to update status' };
  }
}

export async function deleteWorkflowStatusAction(statusId: string) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    await db.delete(projectWorkflowStatuses).where(eq(projectWorkflowStatuses.id, statusId));
    await db.delete(workflowTransitionRules).where(
      or(
        eq(workflowTransitionRules.fromStatusId, statusId),
        eq(workflowTransitionRules.toStatusId, statusId)
      )
    );

    revalidatePath('/');
    return { success: true, message: 'Workflow status removed.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to delete status' };
  }
}

export async function getWorkflowTransitionRulesAction(projectId: string) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const rules = await db
      .select()
      .from(workflowTransitionRules)
      .where(eq(workflowTransitionRules.projectId, projectId));

    return { success: true, rules };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch rules', rules: [] };
  }
}

export async function saveWorkflowTransitionRuleAction(params: {
  id?: string;
  projectId: string;
  fromStatusId?: string | null;
  toStatusId: string;
  requireAssignee?: boolean;
  requireAllSubtasksComplete?: boolean;
  requireResolutionComment?: boolean;
}) {
  try {
    await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const ruleId = params.id || `wtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    if (params.id) {
      await db
        .update(workflowTransitionRules)
        .set({
          fromStatusId: params.fromStatusId ?? null,
          toStatusId: params.toStatusId,
          requireAssignee: params.requireAssignee ?? false,
          requireAllSubtasksComplete: params.requireAllSubtasksComplete ?? false,
          requireResolutionComment: params.requireResolutionComment ?? false,
        })
        .where(eq(workflowTransitionRules.id, params.id));
    } else {
      await db.insert(workflowTransitionRules).values({
        id: ruleId,
        projectId: params.projectId,
        fromStatusId: params.fromStatusId ?? null,
        toStatusId: params.toStatusId,
        requireAssignee: params.requireAssignee ?? false,
        requireAllSubtasksComplete: params.requireAllSubtasksComplete ?? false,
        requireResolutionComment: params.requireResolutionComment ?? false,
      });
    }

    revalidatePath('/');
    return { success: true, message: 'Workflow transition rule saved.' };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to save rule' };
  }
}

/**
 * Enterprise transitionIssueStatusAction:
 * - Fetches workflow rules matching transition
 * - Guard: require_all_subtasks_complete
 * - Guard: require_assignee
 * - Guard: unresolved blockers (IS_BLOCKED_BY) unless PM/Admin override
 * - Guard: require_resolution_comment
 * - Updates issue status atomically & appends audit logs
 */
export async function transitionIssueStatusAction(params: {
  issueId: string;
  targetStatusId: string;
  overrideBlockers?: boolean;
  comment?: string;
}) {
  try {
    const currentUser = await requireRole(['Admin', 'Member']);
    const db = getDb();
    await ensureEnterpriseSchema(db);

    // 1. Fetch Issue
    const issue = await db.query.issues.findFirst({
      where: eq(issues.key, params.issueId),
    });

    if (!issue) {
      return { success: false, error: `Issue ${params.issueId} not found.` };
    }

    const projectId = issue.projectId || 'proj-apex';

    // 2. Resolve Target Status
    // Target status ID could be an ID (ws-xxx) or a status name like 'Done' / 'In Progress'
    let targetStatus = await db.query.projectWorkflowStatuses.findFirst({
      where: and(
        eq(projectWorkflowStatuses.projectId, projectId),
        or(
          eq(projectWorkflowStatuses.id, params.targetStatusId),
          eq(projectWorkflowStatuses.name, params.targetStatusId)
        )
      ),
    });

    const targetStatusName = targetStatus ? targetStatus.name : params.targetStatusId;
    const targetStatusId = targetStatus ? targetStatus.id : params.targetStatusId;
    const oldStatus = issue.status;

    if (oldStatus === targetStatusName) {
      return { success: true, message: 'Status is already unchanged.' };
    }

    // Resolve current status ID
    const currentStatusRecord = await db.query.projectWorkflowStatuses.findFirst({
      where: and(
        eq(projectWorkflowStatuses.projectId, projectId),
        eq(projectWorkflowStatuses.name, oldStatus)
      ),
    });
    const fromStatusId = currentStatusRecord ? currentStatusRecord.id : null;

    // 3. Fetch Applicable Transition Rules
    const rules = await db
      .select()
      .from(workflowTransitionRules)
      .where(
        and(
          eq(workflowTransitionRules.projectId, projectId),
          eq(workflowTransitionRules.toStatusId, targetStatusId)
        )
      );

    // Check specific rule for this from->to, or wildcard rule (fromStatusId is null)
    const matchingRule = rules.find((r) => r.fromStatusId === fromStatusId) ||
      rules.find((r) => r.fromStatusId === null) ||
      rules[0];

    const isMovingToDone =
      (targetStatus && targetStatus.category === 'DONE') ||
      targetStatusName.toLowerCase() === 'done';

    // 4. Rule Validation: require_all_subtasks_complete
    const enforceSubtasks = matchingRule?.requireAllSubtasksComplete || isMovingToDone;
    if (enforceSubtasks) {
      // Check subtasks table
      const openSubtasks = await db
        .select()
        .from(subtasks)
        .where(and(eq(subtasks.issueId, params.issueId), eq(subtasks.completed, false)));

      // Check child issues where parent_issue_id = issue.key
      const openChildren = await db
        .select()
        .from(issues)
        .where(
          and(
            eq(issues.parentIssueId, params.issueId),
            sql`LOWER(${issues.status}) != 'done'`
          )
        );

      if (openSubtasks.length > 0 || openChildren.length > 0) {
        return {
          success: false,
          error: 'Cannot move to Done: all subtasks must be resolved first.',
        };
      }
    }

    // 5. Rule Validation: require_assignee
    if (matchingRule?.requireAssignee && !issue.assigneeId) {
      return {
        success: false,
        error: 'Assignee required for this status transition.',
      };
    }

    // 6. Blocker Rule: Unresolved IS_BLOCKED_BY dependencies
    const blockerLinks = await db
      .select()
      .from(issueLinks)
      .where(
        or(
          and(
            eq(issueLinks.sourceIssueId, params.issueId),
            or(eq(issueLinks.linkType, 'IS_BLOCKED_BY'), eq(issueLinks.relationType, 'is_blocked_by'))
          ),
          and(
            eq(issueLinks.targetIssueId, params.issueId),
            or(eq(issueLinks.linkType, 'BLOCKS'), eq(issueLinks.relationType, 'blocks'))
          )
        )
      );

    if (blockerLinks.length > 0) {
      // Find unresolved blockers
      const blockerKeys = blockerLinks.map((l) =>
        l.sourceIssueId === params.issueId ? l.targetIssueId : l.sourceIssueId
      );

      const openBlockers = await db
        .select()
        .from(issues)
        .where(
          and(
            or(...blockerKeys.map((k) => eq(issues.key, k))),
            sql`LOWER(${issues.status}) != 'done'`
          )
        );

      if (openBlockers.length > 0) {
        const isPM = await verifyProjectAccess(currentUser.id, projectId, 'PROJECT_MANAGER');
        if (!params.overrideBlockers || !isPM) {
          const blockerListStr = openBlockers.map((b) => b.key).join(', ');
          return {
            success: false,
            error: `Cannot transition: issue is blocked by unresolved tickets (${blockerListStr}). Only Project Managers or Admins can override blockers.`,
            isBlocked: true,
            blockingKeys: openBlockers.map((b) => b.key),
          };
        }
      }
    }

    // 7. Rule Validation: require_resolution_comment
    if (matchingRule?.requireResolutionComment && (!params.comment || !params.comment.trim())) {
      return {
        success: false,
        error: 'Resolution comment required for this status transition.',
      };
    }

    // 8. Atomic Transition Execution
    await db.batch([
      db
        .update(issues)
        .set({ status: targetStatusName, updatedAt: new Date() })
        .where(eq(issues.key, params.issueId)),
      db.insert(issueHistory).values({
        id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        issueKey: params.issueId,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: `Transitioned status from "${oldStatus}" to "${targetStatusName}"`,
        field: 'status',
        fromValue: oldStatus,
        toValue: targetStatusName,
      }),
    ]);

    // Optional Resolution Comment insertion
    if (params.comment && params.comment.trim()) {
      await db.insert(comments).values({
        id: `c-tr-${Date.now()}`,
        issueKey: params.issueId,
        authorId: currentUser.id,
        body: `**Resolution comment:** ${params.comment.trim()}`,
      });
    }

    await logIssueAudit(db, {
      issueId: params.issueId,
      actorId: currentUser.id,
      fieldChanged: 'status',
      oldValue: oldStatus,
      newValue: targetStatusName,
    });

    revalidatePath('/');
    return {
      success: true,
      message: `Transitioned ${params.issueId} to ${targetStatusName}`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to transition issue status',
    };
  }
}
