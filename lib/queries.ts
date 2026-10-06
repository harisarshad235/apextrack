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
} from '@/db/schema';
import { FullIssue, FullDocument, WorkspaceMetrics, User, Sprint, Project, Swimlane } from './types';
import { desc, asc } from 'drizzle-orm';

export async function getWorkspaceData(): Promise<{
  users: User[];
  issues: FullIssue[];
  docs: FullDocument[];
  sprints: Sprint[];
  projects: Project[];
  swimlanes: Swimlane[];
  metrics: WorkspaceMetrics;
}> {
  const db = getDb();

  // 1. Fetch Users
  const userList = await db.select().from(users);

  // Map users by ID for fast lookup
  const userMap = new Map<string, User>();
  userList.forEach((u) => userMap.set(u.id, u));

  // 2. Fetch Projects & Swimlanes
  let projectList = await db.select().from(projects).orderBy(asc(projects.name));
  let swimlaneList = await db.select().from(swimlanes).orderBy(asc(swimlanes.sortOrder));

  // Fallback bootstrap if table empty
  if (projectList.length === 0) {
    const defaultProj = {
      id: 'proj-apex',
      key: 'APEX',
      name: 'ApexTrack Platform',
      description: 'Core enterprise agile tracking and architecture knowledge base.',
      category: 'Software',
      leadId: userList[0]?.id || null,
      status: 'active' as const,
    };
    await db.insert(projects).values(defaultProj).onConflictDoNothing();
    projectList = await db.select().from(projects).orderBy(asc(projects.name));
  }

  const projectMap = new Map<string, Project>();
  projectList.forEach((p) => projectMap.set(p.id, p));

  // 3. Fetch Sprints
  const sprintList = await db.select().from(sprints);
  const sprintMap = new Map<string, Sprint>();
  sprintList.forEach((s) => sprintMap.set(s.id, s));

  // 4. Fetch Issues
  const rawIssues = await db.select().from(issues).orderBy(desc(issues.updatedAt));

  // Fetch related records for issues
  const rawComments = await db.select().from(comments).orderBy(desc(comments.createdAt));
  const rawHistory = await db.select().from(issueHistory).orderBy(desc(issueHistory.createdAt));
  const rawAttachments = await db.select().from(attachments);
  const rawLabels = await db.select().from(labels);
  const rawIssueLabels = await db.select().from(issueLabels);
  const rawSubtasks = await db.select().from(subtasks).orderBy(asc(subtasks.sortOrder));
  const rawLinks = await db.select().from(issueLinks);

  const subtasksByIssue = new Map<string, (typeof subtasks.$inferSelect)[]>();
  rawSubtasks.forEach((s) => {
    subtasksByIssue.set(s.issueId, [...(subtasksByIssue.get(s.issueId) || []), s]);
  });
  const linksByIssue = new Map<string, (typeof issueLinks.$inferSelect)[]>();
  rawLinks.forEach((l) => {
    linksByIssue.set(l.sourceIssueId, [...(linksByIssue.get(l.sourceIssueId) || []), l]);
    linksByIssue.set(l.targetIssueId, [...(linksByIssue.get(l.targetIssueId) || []), l]);
  });

  // Map labels
  const labelMap = new Map<number, string>();
  rawLabels.forEach((l) => labelMap.set(l.id, l.name));

  const issueLabelsMap = new Map<string, string[]>();
  rawIssueLabels.forEach((il) => {
    const name = labelMap.get(il.labelId);
    if (name) {
      const existing = issueLabelsMap.get(il.issueKey) || [];
      issueLabelsMap.set(il.issueKey, [...existing, name]);
    }
  });

  // Map comments by issue
  const commentsByIssue = new Map<string, (typeof comments.$inferSelect & { author?: User | null })[]>();
  rawComments.forEach((c) => {
    const author = c.authorId ? userMap.get(c.authorId) : null;
    const existing = commentsByIssue.get(c.issueKey) || [];
    commentsByIssue.set(c.issueKey, [...existing, { ...c, author }]);
  });

  // Map history by issue
  const historyByIssue = new Map<string, (typeof issueHistory.$inferSelect)[]>();
  rawHistory.forEach((h) => {
    const existing = historyByIssue.get(h.issueKey) || [];
    historyByIssue.set(h.issueKey, [...existing, h]);
  });

  // Map attachments by issue / document
  const issueAttachmentsMap = new Map<string, (typeof attachments.$inferSelect)[]>();
  const docAttachmentsMap = new Map<string, (typeof attachments.$inferSelect)[]>();

  rawAttachments.forEach((att) => {
    if (att.issueKey) {
      const existing = issueAttachmentsMap.get(att.issueKey) || [];
      issueAttachmentsMap.set(att.issueKey, [...existing, att]);
    } else if (att.documentId) {
      const existing = docAttachmentsMap.get(att.documentId) || [];
      docAttachmentsMap.set(att.documentId, [...existing, att]);
    }
  });

  // Build Full Issues
  const defaultProject = projectList[0] || null;
  const fullIssues: FullIssue[] = rawIssues.map((issue) => {
    return {
      ...issue,
      labels: issueLabelsMap.get(issue.key) || [],
      comments: commentsByIssue.get(issue.key) || [],
      history: historyByIssue.get(issue.key) || [],
      attachments: issueAttachmentsMap.get(issue.key) || [],
      subtasks: subtasksByIssue.get(issue.key) || [],
      links: linksByIssue.get(issue.key) || [],
      assignee: issue.assigneeId ? userMap.get(issue.assigneeId) : null,
      reporter: issue.reporterId ? userMap.get(issue.reporterId) : null,
      sprint: issue.sprintId ? sprintMap.get(issue.sprintId) : null,
      project: issue.projectId ? projectMap.get(issue.projectId) : defaultProject,
    };
  });

  // 5. Fetch Documents
  const rawDocs = await db.select().from(documents).orderBy(desc(documents.updatedAt));

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

