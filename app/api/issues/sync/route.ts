import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? Number(sinceParam) : 0;

    const db = getDb();

    let query;
    if (projectId && projectId !== 'default') {
      if (since > 0) {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          WHERE (project_id = ${projectId} OR project_id IS NULL)
            AND updated_at > ${since}
          ORDER BY updated_at ASC
        `;
      } else {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          WHERE project_id = ${projectId} OR project_id IS NULL
          ORDER BY updated_at ASC
        `;
      }
    } else {
      if (since > 0) {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          WHERE updated_at > ${since}
          ORDER BY updated_at ASC
        `;
      } else {
        query = sql`
          SELECT 
            key,
            project_id as projectId,
            title,
            type,
            issue_type as issueType,
            status,
            priority,
            assignee_id as assigneeId,
            sprint_id as sprintId,
            story_points as storyPoints,
            rank,
            is_flagged as isFlagged,
            updated_at as updatedAt
          FROM issues
          ORDER BY updated_at ASC
        `;
      }
    }

    const updatedIssues = await db.all(query);

    return NextResponse.json(
      {
        issues: updatedIssues,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/issues/sync:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync issues' },
      { status: 500 }
    );
  }
}
