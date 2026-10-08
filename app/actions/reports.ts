'use server';

import { eq, desc, asc, and, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { ensureEnterpriseSchema } from '@/lib/schemaInit';
import { sprints, issues, issueAuditLogs, issueHistory, projectWorkflowStatuses } from '@/db/schema';

export interface BurndownDay {
  dayIndex: number;
  dateStr: string;
  idealBurn: number;
  actualRemaining: number | null;
  completedPoints: number;
}

export interface VelocitySprintMetric {
  sprintId: string;
  sprintName: string;
  state: string;
  committedPoints: number;
  completedPoints: number;
}

export interface CFDDayMetric {
  date: string;
  todo: number;
  inProgress: number;
  done: number;
}

const DAY_MS = 86400000;

/**
 * Calculates sprint burndown chart data:
 * - Ideal linear trajectory from committedPoints to 0.
 * - Actual burn curve aggregated by day from audit logs / completion timestamps.
 */
export async function getSprintBurndownAction(sprintId: string) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const sprint = await db.query.sprints.findFirst({
      where: eq(sprints.id, sprintId),
    });

    if (!sprint || !sprint.startDate || !sprint.endDate) {
      return {
        success: false,
        error: 'Sprint not found or missing start/end dates',
        days: [],
        totalCommitted: 0,
      };
    }

    const startMs = new Date(sprint.startDate).getTime();
    const endMs = new Date(sprint.endDate).getTime();

    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
      return {
        success: false,
        error: 'Invalid sprint date range',
        days: [],
        totalCommitted: 0,
      };
    }

    // Retrieve all issues associated with this sprint
    const sprintIssues = await db
      .select()
      .from(issues)
      .where(eq(issues.sprintId, sprintId));

    const totalCommitted = sprintIssues.reduce(
      (sum, i) => sum + (Number(i.storyPoints) || 0),
      0
    );

    // Retrieve audit logs and history for issues moving to Done
    const issueKeys = sprintIssues.map((i) => i.key);
    const doneTimestampMap = new Map<string, number>();

    if (issueKeys.length > 0) {
      // Check issueAuditLogs
      const auditEntries = await db
        .select()
        .from(issueAuditLogs)
        .where(
          and(
            eq(issueAuditLogs.fieldChanged, 'status'),
            sql`LOWER(${issueAuditLogs.newValue}) = 'done'`
          )
        );

      auditEntries.forEach((a) => {
        if (issueKeys.includes(a.issueId)) {
          const t = new Date(a.createdAt).getTime();
          const prev = doneTimestampMap.get(a.issueId) || 0;
          if (t > prev) doneTimestampMap.set(a.issueId, t);
        }
      });

      // Also check issueHistory fallback
      const historyEntries = await db
        .select()
        .from(issueHistory)
        .where(
          and(
            eq(issueHistory.field, 'status'),
            sql`LOWER(${issueHistory.toValue}) = 'done'`
          )
        );

      historyEntries.forEach((h) => {
        if (issueKeys.includes(h.issueKey)) {
          const t = new Date(h.createdAt).getTime();
          const prev = doneTimestampMap.get(h.issueKey) || 0;
          if (t > prev) doneTimestampMap.set(h.issueKey, t);
        }
      });
    }

    // Issues marked Done with points
    const completedItems = sprintIssues
      .filter((i) => i.status.toLowerCase() === 'done')
      .map((i) => ({
        key: i.key,
        points: Number(i.storyPoints) || 0,
        doneAt: doneTimestampMap.get(i.key) || new Date(i.updatedAt).getTime(),
      }));

    const totalDays = Math.max(1, Math.round((endMs - startMs) / DAY_MS));
    const nowMs = Date.now();
    const daysData: BurndownDay[] = [];

    for (let d = 0; d <= totalDays; d++) {
      const currentDayMs = startMs + d * DAY_MS;
      const dateStr = new Date(currentDayMs).toISOString().split('T')[0];
      const idealBurn = Math.max(0, Math.round((totalCommitted - (totalCommitted * d) / totalDays) * 10) / 10);

      if (currentDayMs > nowMs + DAY_MS) {
        daysData.push({
          dayIndex: d,
          dateStr,
          idealBurn,
          actualRemaining: null,
          completedPoints: 0,
        });
      } else {
        const burnedUpToDay = completedItems
          .filter((item) => item.doneAt <= currentDayMs + DAY_MS - 1)
          .reduce((sum, item) => sum + item.points, 0);

        const actualRemaining = Math.max(0, totalCommitted - burnedUpToDay);

        daysData.push({
          dayIndex: d,
          dateStr,
          idealBurn,
          actualRemaining,
          completedPoints: burnedUpToDay,
        });
      }
    }

    return {
      success: true,
      sprintName: sprint.name,
      totalCommitted,
      days: daysData,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to calculate burndown',
      days: [],
      totalCommitted: 0,
    };
  }
}

/**
 * Calculates velocity report across closed/historical sprints:
 * - Committed vs Completed story points
 * - Rolling team velocity average
 */
export async function getVelocityReportAction(projectId: string) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    // Fetch all sprints, prioritize closed and active sprints
    const allSprints = await db
      .select()
      .from(sprints)
      .orderBy(desc(sprints.createdAt))
      .limit(10);

    const allIssues = await db
      .select()
      .from(issues)
      .where(projectId ? eq(issues.projectId, projectId) : undefined);

    const metrics: VelocitySprintMetric[] = [];

    for (const sprint of allSprints.reverse()) {
      const sprintIssues = allIssues.filter((i) => i.sprintId === sprint.id);
      const committedPoints = sprintIssues.reduce(
        (sum, i) => sum + (Number(i.storyPoints) || 0),
        0
      );
      const completedPoints = sprintIssues
        .filter((i) => i.status.toLowerCase() === 'done')
        .reduce((sum, i) => sum + (Number(i.storyPoints) || 0), 0);

      metrics.push({
        sprintId: sprint.id,
        sprintName: sprint.name,
        state: sprint.state,
        committedPoints,
        completedPoints,
      });
    }

    // Compute rolling team velocity average
    const closedMetrics = metrics.filter((m) => m.state === 'closed');
    const velocityPool = closedMetrics.length > 0 ? closedMetrics : metrics;
    const rollingVelocityAverage =
      velocityPool.length > 0
        ? Math.round(
            velocityPool.reduce((acc, m) => acc + m.completedPoints, 0) /
              velocityPool.length
          )
        : 0;

    return {
      success: true,
      sprints: metrics,
      rollingVelocityAverage,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to calculate velocity',
      sprints: [],
      rollingVelocityAverage: 0,
    };
  }
}

/**
 * Calculates Cumulative Flow Diagram (CFD) distribution over the past N days.
 */
export async function getCumulativeFlowDiagramAction(projectId: string, days = 14) {
  try {
    const db = getDb();
    await ensureEnterpriseSchema(db);

    const allIssues = await db
      .select()
      .from(issues)
      .where(projectId ? eq(issues.projectId, projectId) : undefined);

    const now = Date.now();
    const result: CFDDayMetric[] = [];

    for (let d = days - 1; d >= 0; d--) {
      const dayEndMs = now - d * DAY_MS;
      const dateStr = new Date(dayEndMs).toISOString().split('T')[0];

      // Issues that existed at dayEndMs
      const existingAtDay = allIssues.filter(
        (i) => new Date(i.createdAt).getTime() <= dayEndMs
      );

      let todo = 0;
      let inProgress = 0;
      let done = 0;

      for (const item of existingAtDay) {
        const lowerStatus = item.status.toLowerCase();
        if (lowerStatus === 'done' || lowerStatus === 'closed') {
          // Check if it was done by dayEndMs
          const updatedMs = new Date(item.updatedAt).getTime();
          if (updatedMs <= dayEndMs) {
            done++;
          } else {
            inProgress++;
          }
        } else if (lowerStatus.includes('progress') || lowerStatus.includes('review') || lowerStatus.includes('dev')) {
          inProgress++;
        } else {
          todo++;
        }
      }

      result.push({
        date: dateStr,
        todo,
        inProgress,
        done,
      });
    }

    return { success: true, cfd: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to calculate CFD',
      cfd: [],
    };
  }
}
