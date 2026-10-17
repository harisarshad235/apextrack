import 'server-only';
import { getDb } from './db';
import {
  users,
  issues,
  comments,
  documents,
  attachments,
  sprints,
  labels,
  issueLabels,
  issueHistory,
  projects,
  swimlanes,
  subtasks,
  issueLinks,
  issueAuditLogs,
  issueGitLinks,
  issueComments,
} from '@/db/schema';
import { FullIssue, FullDocument, WorkspaceMetrics, User, Sprint, Project, Swimlane } from './types';
import { desc, asc, sql } from 'drizzle-orm';
import { ensureProjectRbacTables } from './rbac';

export async function getWorkspaceData(currentUser?: User | null): Promise<{
  users: User[];
  issues: FullIssue[];
  docs: FullDocument[];
  sprints: Sprint[];
  projects: Project[];
  swimlanes: Swimlane[];
  metrics: WorkspaceMetrics;
}> {
  const db = getDb();

  // Run all primary queries in parallel via Promise.all for minimal CPU time and latency
  let [
    rawUsers,
    projectListRaw,
    swimlaneList,
    sprintList,
    rawIssues,
    rawComments,
    rawIssueComments,
    rawHistory,
    rawAuditLogs,
    rawGitLinks,
    rawAttachments,
    rawLabels,
    rawIssueLabels,
    rawSubtasks,
    rawLinks,
    rawDocs,
  ] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        authProvider: users.authProvider,
        department: users.department,
        avatarUrl: users.avatarUrl,
        approvedById: users.approvedById,
        approvedAt: users.approvedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users),
    db.select().from(projects).orderBy(asc(projects.name)),
    db.select().from(swimlanes).orderBy(asc(swimlanes.sortOrder)),
    db.select().from(sprints),
    db.select().from(issues).orderBy(desc(issues.updatedAt)),
    db.select().from(comments).orderBy(desc(comments.createdAt)).limit(150),
    db.select().from(issueComments).orderBy(desc(issueComments.createdAt)).limit(150).catch(() => []),
    db.select().from(issueHistory).orderBy(desc(issueHistory.createdAt)).limit(100).catch(() => []),
    db.select().from(issueAuditLogs).orderBy(desc(issueAuditLogs.createdAt)).limit(50).catch(() => []),
    db.select().from(issueGitLinks).orderBy(desc(issueGitLinks.createdAt)).limit(50).catch(() => []),
    db.select().from(attachments),
    db.select().from(labels),
    db.select().from(issueLabels),
    db.select().from(subtasks).orderBy(asc(subtasks.sortOrder)),
    db.select().from(issueLinks),
    db.select().from(documents).orderBy(desc(documents.updatedAt)),
  ]);

  // Strip sensitive password hash and map to User
  const userList: User[] = rawUsers.map((u) => ({
    ...u,
    passwordHash: null,
    providerId: null,
  }));

  // Map users by ID for fast lookup
  const userMap = new Map<string, User>();
  userList.forEach((u) => userMap.set(u.id, u));

  // Fallback bootstrap if table empty
  let projectList = projectListRaw;
  if (projectList.length === 0) {
    const defaultProj = {
      id: 'proj-apex',
      key: 'KYN',
      name: 'Kynov Platform',
      description: 'Core enterprise agile tracking and architecture knowledge base.',
      category: 'Software',
      leadId: userList[0]?.id || null,
      status: 'active' as const,
    };
    await db.insert(projects).values(defaultProj).onConflictDoNothing();
    projectList = await db.select().from(projects).orderBy(asc(projects.name));
  }

  // Project-level RBAC & Scoping (Linear / Jira Permission Scheme):
  // - Workspace Super Admins receive all active projects and issues across the organization.
  // - Non-admin users strictly only see projects they have been assigned to in project_members.
  // - If a newly registered user has 0 assigned projects, their projectList, swimlaneList, sprintList, and issues are empty ([]).
  if (currentUser) {
    const roleStr = String(currentUser.role || '');
    const isSuperAdmin = roleStr === 'Admin' || roleStr === 'ADMIN' || roleStr.toUpperCase() === 'ADMIN';

    if (!isSuperAdmin) {
      await ensureProjectRbacTables(db);
      const userMemberships = await db.all<{ project_id: string }>(sql`
        SELECT project_id FROM project_members WHERE user_id = ${currentUser.id}
      `).catch(() => []);
      const allowedProjectIds = new Set(userMemberships.map((m) => m.project_id));

      projectList = projectList.filter((p) => allowedProjectIds.has(p.id));
      swimlaneList = swimlaneList.filter((s) => allowedProjectIds.has(s.projectId));
      sprintList = sprintList.filter((s) => {
        const pId = (s as any).projectId || (s as any).project_id;
        return pId ? allowedProjectIds.has(pId) : false;
      });
      rawIssues = rawIssues.filter((i) => i.projectId && allowedProjectIds.has(i.projectId));
    }
  }

  const projectMap = new Map<string, Project>();
  projectList.forEach((p) => projectMap.set(p.id, p));

  const sprintMap = new Map<string, Sprint>();
  sprintList.forEach((s) => sprintMap.set(s.id, s));

  // Efficient map groupings without quadratic allocations
  const subtasksByIssue = new Map<string, (typeof subtasks.$inferSelect)[]>();
  rawSubtasks.forEach((s) => {
    const list = subtasksByIssue.get(s.issueId);
    if (list) list.push(s);
    else subtasksByIssue.set(s.issueId, [s]);
  });

  const linksByIssue = new Map<string, (typeof issueLinks.$inferSelect)[]>();
  rawLinks.forEach((l) => {
    const src = linksByIssue.get(l.sourceIssueId);
    if (src) src.push(l);
    else linksByIssue.set(l.sourceIssueId, [l]);

    const tgt = linksByIssue.get(l.targetIssueId);
    if (tgt) tgt.push(l);
    else linksByIssue.set(l.targetIssueId, [l]);
  });

  const auditLogsByIssue = new Map<string, (typeof issueAuditLogs.$inferSelect)[]>();
  rawAuditLogs.forEach((a) => {
    const list = auditLogsByIssue.get(a.issueId);
    if (list) list.push(a);
    else auditLogsByIssue.set(a.issueId, [a]);
  });

  const gitLinksByIssue = new Map<string, (typeof issueGitLinks.$inferSelect)[]>();
  rawGitLinks.forEach((g) => {
    const list = gitLinksByIssue.get(g.issueId);
    if (list) list.push(g);
    else gitLinksByIssue.set(g.issueId, [g]);
  });

  // Map labels
  const labelMap = new Map<number, string>();
  rawLabels.forEach((l) => labelMap.set(l.id, l.name));

  const issueLabelsMap = new Map<string, string[]>();
  rawIssueLabels.forEach((il) => {
    const name = labelMap.get(il.labelId);
    if (name) {
      const list = issueLabelsMap.get(il.issueKey);
      if (list) list.push(name);
      else issueLabelsMap.set(il.issueKey, [name]);
    }
  });

  // Map comments by issue
  const commentsByIssue = new Map<string, (typeof comments.$inferSelect & { author?: User | null })[]>();
  rawComments.forEach((c) => {
    const author = c.authorId ? userMap.get(c.authorId) : null;
    const item = { ...c, author };
    const list = commentsByIssue.get(c.issueKey);
    if (list) list.push(item);
    else commentsByIssue.set(c.issueKey, [item]);
  });

  const customCommentsByIssue = new Map<string, (typeof issueComments.$inferSelect & { author?: User | null })[]>();
  rawIssueComments.forEach((c) => {
    const author = c.authorId ? userMap.get(c.authorId) : null;
    const item = { ...c, author };
    const list = customCommentsByIssue.get(c.issueId);
    if (list) list.push(item);
    else customCommentsByIssue.set(c.issueId, [item]);
  });

  // Map history by issue
  const historyByIssue = new Map<string, (typeof issueHistory.$inferSelect)[]>();
  rawHistory.forEach((h) => {
    const list = historyByIssue.get(h.issueKey);
    if (list) list.push(h);
    else historyByIssue.set(h.issueKey, [h]);
  });

  // Map attachments by issue / document
  const issueAttachmentsMap = new Map<string, (typeof attachments.$inferSelect)[]>();
  const docAttachmentsMap = new Map<string, (typeof attachments.$inferSelect)[]>();

  rawAttachments.forEach((att) => {
    if (att.issueKey) {
      const list = issueAttachmentsMap.get(att.issueKey);
      if (list) list.push(att);
      else issueAttachmentsMap.set(att.issueKey, [att]);
    } else if (att.documentId) {
      const list = docAttachmentsMap.get(att.documentId);
      if (list) list.push(att);
      else docAttachmentsMap.set(att.documentId, [att]);
    }
  });

  // Initial pass to build full issues map
  const defaultProject = projectList[0] || null;
  const issuesMap = new Map<string, FullIssue>();

  const baseIssues: FullIssue[] = rawIssues.map((issue) => {
    const full: FullIssue = {
      ...issue,
      issueType: issue.issueType || (issue.type?.toUpperCase() as any) || 'TASK',
      labels: issueLabelsMap.get(issue.key) || [],
      comments: commentsByIssue.get(issue.key) || [],
      customComments: customCommentsByIssue.get(issue.key) || [],
      history: historyByIssue.get(issue.key) || [],
      auditLogs: auditLogsByIssue.get(issue.key) || [],
      gitLinks: gitLinksByIssue.get(issue.key) || [],
      attachments: issueAttachmentsMap.get(issue.key) || [],
      subtasks: subtasksByIssue.get(issue.key) || [],
      links: linksByIssue.get(issue.key) || [],
      assignee: issue.assigneeId ? userMap.get(issue.assigneeId) : null,
      reporter: issue.reporterId ? userMap.get(issue.reporterId) : null,
      sprint: issue.sprintId ? sprintMap.get(issue.sprintId) : null,
      project: issue.projectId ? projectMap.get(issue.projectId) : defaultProject,
    };
    issuesMap.set(issue.key, full);
    return full;
  });

  // Second pass: resolve parent/children and blocked-by relationships
  const fullIssues: FullIssue[] = baseIssues.map((issue) => {
    const parent = issue.parentIssueId ? issuesMap.get(issue.parentIssueId) || null : null;
    const children = baseIssues.filter((i) => i.parentIssueId === issue.key);

    // Blocker relationships
    const blockedByKeys = (issue.links || [])
      .filter((l) => {
        const type = (l.linkType || (l as any).relationType || '').toUpperCase();
        return (type === 'IS_BLOCKED_BY' && l.sourceIssueId === issue.key) ||
               (type === 'BLOCKS' && l.targetIssueId === issue.key);
      })
      .map((l) => (l.sourceIssueId === issue.key ? l.targetIssueId : l.sourceIssueId));

    const blockingKeys = (issue.links || [])
      .filter((l) => {
        const type = (l.linkType || (l as any).relationType || '').toUpperCase();
        return (type === 'BLOCKS' && l.sourceIssueId === issue.key) ||
               (type === 'IS_BLOCKED_BY' && l.targetIssueId === issue.key);
      })
      .map((l) => (l.sourceIssueId === issue.key ? l.targetIssueId : l.sourceIssueId));

    const blockedByIssues = blockedByKeys
      .map((k) => issuesMap.get(k))
      .filter((i): i is FullIssue => Boolean(i));

    const blockingIssues = blockingKeys
      .map((k) => issuesMap.get(k))
      .filter((i): i is FullIssue => Boolean(i));

    return {
      ...issue,
      parent,
      children,
      blockedByIssues,
      blockingIssues,
    };
  });

  // 5. Fetch Documents (using rawDocs from parallel Promise.all)
  const fullDocs: FullDocument[] = rawDocs.map((doc) => ({
    ...doc,
    author: doc.authorId ? userMap.get(doc.authorId) : null,
    attachments: docAttachmentsMap.get(doc.id) || [],
  }));

  // 6. Calculate Metrics
  const total = fullIssues.length;
  const completed = fullIssues.filter((i) => i.status === 'Done').length;
  const inProgress = fullIssues.filter((i) => i.status === 'In Progress').length;
  const openBugs = fullIssues.filter((i) => i.type === 'Bug' && i.status !== 'Done').length;
  const totalPoints = fullIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
  const completedPoints = fullIssues
    .filter((i) => i.status === 'Done')
    .reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const metrics: WorkspaceMetrics = {
    total,
    completed,
    inProgress,
    openBugs,
    totalPoints,
    completedPoints,
    completionRate,
  };

  return {
    users: userList,
    issues: fullIssues,
    docs: fullDocs,
    sprints: sprintList,
    projects: projectList,
    swimlanes: swimlaneList,
    metrics,
  };
}

