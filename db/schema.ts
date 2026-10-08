import { sql, relations } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/sqlite-core';

/* ------------------------------------------------------------------ */
/* Enumerations (kept as TS tuples so they double as Zod/UI sources)   */
/* ------------------------------------------------------------------ */
export const USER_ROLES = ['Admin', 'Member', 'Viewer'] as const;
export const USER_STATUSES = ['PENDING', 'APPROVED', 'SUSPENDED'] as const;
export const ISSUE_TYPES = [
  'Story', 'Bug', 'Task', 'Epic', 'Subtask',
  'STORY', 'BUG', 'TASK', 'EPIC', 'SUBTASK'
] as const;
export const JIRA_ISSUE_TYPES = ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'] as const;
export type JiraIssueType = (typeof JIRA_ISSUE_TYPES)[number];

export const WORKFLOW_CATEGORIES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export type WorkflowCategory = (typeof WORKFLOW_CATEGORIES)[number];

export const ENTERPRISE_LINK_TYPES = ['BLOCKS', 'IS_BLOCKED_BY', 'RELATES_TO', 'DUPLICATES'] as const;
export type EnterpriseLinkType = (typeof ENTERPRISE_LINK_TYPES)[number];

export const GIT_LINK_PROVIDERS = ['GITHUB', 'GITLAB', 'BITBUCKET'] as const;
export const GIT_REF_TYPES = ['BRANCH', 'PULL_REQUEST', 'COMMIT'] as const;
export const GIT_STATUSES = ['OPEN', 'MERGED', 'CLOSED'] as const;

export const ISSUE_PRIORITIES = ['Critical', 'High', 'Medium', 'Low', 'Lowest'] as const;
export const ISSUE_STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'] as const;
export const SPRINT_STATES = ['active', 'upcoming', 'closed'] as const;
export const DOC_CATEGORIES = ['Architecture', 'Product Specs', 'Runbooks', 'Sprint Notes'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type IssueType = (typeof ISSUE_TYPES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`);
const updatedAt = () =>
  integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`);

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash'),
    role: text('role', { enum: USER_ROLES }).notNull().default('Viewer'),
    status: text('status', { enum: USER_STATUSES }).notNull().default('PENDING'),
    department: text('department'),
    avatarUrl: text('avatar_url'),
    approvedById: text('approved_by_id'),
    approvedAt: integer('approved_at', { mode: 'timestamp_ms' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('users_email_uq').on(t.email), index('users_status_idx').on(t.status)],
);

/* ------------------------------------------------------------------ */
/* Projects & Multi-Project Workspaces                                 */
/* ------------------------------------------------------------------ */
export const PROJECT_STATUSES = ['active', 'archived'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(), // e.g. "proj-apex"
    key: text('key').notNull(), // e.g. "APEX", "CORE"
    name: text('name').notNull(),
    description: text('description').default(''),
    category: text('category').default('Software'),
    leadId: text('lead_id').references(() => users.id, { onDelete: 'set null' }),
    status: text('status', { enum: PROJECT_STATUSES }).notNull().default('active'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('projects_key_uq').on(t.key), index('projects_status_idx').on(t.status)],
);

/* ------------------------------------------------------------------ */
/* Dynamic Swimlanes (Board Columns) per Project                      */
/* ------------------------------------------------------------------ */
export const swimlanes = sqliteTable(
  'swimlanes',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // Column name e.g. "To Do", "In Progress", "QA"
    statusKey: text('status_key').notNull(),
    color: text('color').default('border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('swimlanes_project_idx').on(t.projectId)],
);

/* ------------------------------------------------------------------ */
/* Atomic issue-key allocation (APEX-###)                              */
/* ------------------------------------------------------------------ */
export const projectCounters = sqliteTable('project_counters', {
  projectKey: text('project_key').primaryKey(),
  nextSeq: integer('next_seq').notNull().default(101),
});

/* ------------------------------------------------------------------ */
/* Sprints                                                             */
/* ------------------------------------------------------------------ */
export const sprints = sqliteTable(
  'sprints',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    state: text('state', { enum: SPRINT_STATES }).notNull().default('upcoming'),
    goal: text('goal'),
    startDate: text('start_date'), // ISO yyyy-mm-dd
    endDate: text('end_date'),
    createdAt: createdAt(),
  },
  (t) => [index('sprints_state_idx').on(t.state)],
);

/* ------------------------------------------------------------------ */
/* Issues                                                              */
/* ------------------------------------------------------------------ */
export const issues = sqliteTable(
  'issues',
  {
    key: text('key').primaryKey(), // e.g. APEX-101
    projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    parentIssueId: text('parent_issue_id').references((): any => issues.key, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    type: text('type', { enum: ISSUE_TYPES }).notNull().default('Task'),
    issueType: text('issue_type').notNull().default('TASK'),
    epicColor: text('epic_color').default('#3B82F6'),
    priority: text('priority', { enum: ISSUE_PRIORITIES }).notNull().default('Medium'),
    status: text('status').notNull().default('To Do'),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    reporterId: text('reporter_id').references(() => users.id, { onDelete: 'set null' }),
    sprintId: text('sprint_id').references(() => sprints.id, { onDelete: 'set null' }), // null = backlog
    storyPoints: integer('story_points').default(0),
    originalEstimateHours: real('original_estimate_hours'),
    remainingEstimateHours: real('remaining_estimate_hours'),
    dueDate: text('due_date'),
    rank: integer('rank').notNull().default(0),
    isFlagged: integer('is_flagged', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('issues_project_idx').on(t.projectId),
    index('issues_status_idx').on(t.status),
    index('issues_assignee_idx').on(t.assigneeId),
    index('issues_sprint_idx').on(t.sprintId),
    index('idx_issues_parent').on(t.parentIssueId),
  ],
);

export const labels = sqliteTable(
  'labels',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
  },
  (t) => [uniqueIndex('labels_name_uq').on(t.name)],
);

export const issueLabels = sqliteTable(
  'issue_labels',
  {
    issueKey: text('issue_key')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    labelId: integer('label_id')
      .notNull()
      .references(() => labels.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.issueKey, t.labelId] })],
);

export const comments = sqliteTable(
  'comments',
  {
    id: text('id').primaryKey(),
    issueKey: text('issue_key')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('comments_issue_idx').on(t.issueKey)],
);

export const issueHistory = sqliteTable(
  'issue_history',
  {
    id: text('id').primaryKey(),
    issueKey: text('issue_key')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorName: text('actor_name').notNull(), // denormalized: survives user deletion
    action: text('action').notNull(),
    field: text('field'),
    fromValue: text('from_value'),
    toValue: text('to_value'),
    createdAt: createdAt(),
  },
  (t) => [index('history_issue_idx').on(t.issueKey)],
);

/* ------------------------------------------------------------------ */
/* Subtasks, Issue Links & Notifications                               */
/* NOTE: issues' primary key is `key` (e.g. APEX-101), so FKs target it.*/
/* ------------------------------------------------------------------ */
export const LINK_TYPES = ['blocks', 'is_blocked_by', 'relates_to', 'duplicates', 'BLOCKS', 'IS_BLOCKED_BY', 'RELATES_TO', 'DUPLICATES'] as const;
export type LinkType = (typeof LINK_TYPES)[number];

export const subtasks = sqliteTable(
  'subtasks',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    title: text('title').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('subtasks_issue_idx').on(t.issueId)],
);

export const issueLinks = sqliteTable(
  'issue_links',
  {
    id: text('id').primaryKey(),
    sourceIssueId: text('source_issue_id')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    targetIssueId: text('target_issue_id')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    linkType: text('link_type').notNull().default('RELATES_TO'),
    relationType: text('relation_type', { enum: LINK_TYPES }).notNull().default('relates_to'),
    createdAt: createdAt(),
  },
  (t) => [
    index('idx_issue_links_source').on(t.sourceIssueId),
    index('idx_issue_links_target').on(t.targetIssueId),
    uniqueIndex('idx_issue_links_source_target_type_uq').on(t.sourceIssueId, t.targetIssueId, t.linkType),
    check('issue_links_no_self_ref_ck', sql`${t.sourceIssueId} != ${t.targetIssueId}`),
  ],
);

/* ------------------------------------------------------------------ */
/* Activity Stream, Comments, and Audit Trail (Enterprise)            */
/* ------------------------------------------------------------------ */
export const issueComments = sqliteTable(
  'issue_comments',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('idx_comments_issue').on(t.issueId)],
);

export const issueAuditLogs = sqliteTable(
  'issue_audit_logs',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    actorId: text('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fieldChanged: text('field_changed').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    createdAt: createdAt(),
  },
  (t) => [index('idx_audit_issue').on(t.issueId)],
);

/* ------------------------------------------------------------------ */
/* Configurable Custom Workflows & Board Columns                      */
/* ------------------------------------------------------------------ */
export const projectWorkflowStatuses = sqliteTable(
  'project_workflow_statuses',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    category: text('category', { enum: WORKFLOW_CATEGORIES }).notNull().default('TODO'),
    position: integer('position').notNull().default(0),
    wipLimit: integer('wip_limit').notNull().default(0),
    isInitial: integer('is_initial', { mode: 'boolean' }).notNull().default(false),
    isFinal: integer('is_final', { mode: 'boolean' }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index('idx_workflow_project').on(t.projectId)],
);

export const workflowTransitionRules = sqliteTable(
  'workflow_transition_rules',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    fromStatusId: text('from_status_id'),
    toStatusId: text('to_status_id').notNull(),
    requireAssignee: integer('require_assignee', { mode: 'boolean' }).notNull().default(false),
    requireAllSubtasksComplete: integer('require_all_subtasks_complete', { mode: 'boolean' }).notNull().default(false),
    requireResolutionComment: integer('require_resolution_comment', { mode: 'boolean' }).notNull().default(false),
  },
  (t) => [index('idx_transition_rules_project').on(t.projectId)],
);

/* ------------------------------------------------------------------ */
/* Git / Development Linking                                          */
/* ------------------------------------------------------------------ */
export const issueGitLinks = sqliteTable(
  'issue_git_links',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    provider: text('provider').notNull().default('GITHUB'),
    repoFullName: text('repo_full_name').notNull(),
    refType: text('ref_type').notNull(), // 'BRANCH', 'PULL_REQUEST', 'COMMIT'
    refName: text('ref_name').notNull(),
    url: text('url').notNull(),
    status: text('status').default('OPEN'), // 'OPEN', 'MERGED', 'CLOSED'
    createdAt: createdAt(),
  },
  (t) => [index('idx_git_links_issue').on(t.issueId)],
);

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
    issueId: text('issue_id').references(() => issues.key, { onDelete: 'cascade', onUpdate: 'cascade' }),
    title: text('title'),
    message: text('message').notNull(),
    linkUrl: text('link_url'),
    read: integer('read', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
  },
  (t) => [index('notifications_user_idx').on(t.userId, t.read)],
);


/* ------------------------------------------------------------------ */
/* Knowledge base                                                      */
/* ------------------------------------------------------------------ */
export const documents = sqliteTable(
  'documents',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull().default('Architecture'),
    content: text('content').notNull().default(''),
    authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
    updatedById: text('updated_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('documents_category_idx').on(t.category)],
);

/* ------------------------------------------------------------------ */
/* Attachments (R2-backed). Exactly one owner: issue XOR document.     */
/* ------------------------------------------------------------------ */
export const attachments = sqliteTable(
  'attachments',
  {
    id: text('id').primaryKey(),
    issueKey: text('issue_key').references(() => issues.key, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    documentId: text('document_id').references(() => documents.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    contentType: text('content_type').notNull().default('application/octet-stream'),
    sizeBytes: integer('size_bytes').notNull(),
    r2Key: text('r2_key').notNull(),
    uploadedById: text('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('attachments_r2key_uq').on(t.r2Key),
    index('attachments_issue_idx').on(t.issueKey),
    index('attachments_doc_idx').on(t.documentId),
    check(
      'attachments_owner_ck',
      sql`(${t.issueKey} IS NOT NULL AND ${t.documentId} IS NULL) OR (${t.issueKey} IS NULL AND ${t.documentId} IS NOT NULL)`,
    ),
  ],
);

/* ------------------------------------------------------------------ */
/* Relations (for db.query.* relational API)                           */
/* ------------------------------------------------------------------ */
export const usersRelations = relations(users, ({ many }) => ({
  assignedIssues: many(issues, { relationName: 'assignee' }),
  reportedIssues: many(issues, { relationName: 'reporter' }),
  comments: many(comments),
  documents: many(documents, { relationName: 'author' }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  lead: one(users, { fields: [projects.leadId], references: [users.id] }),
  issues: many(issues),
  swimlanes: many(swimlanes),
}));

export const swimlanesRelations = relations(swimlanes, ({ one }) => ({
  project: one(projects, { fields: [swimlanes.projectId], references: [projects.id] }),
}));

export const sprintsRelations = relations(sprints, ({ many }) => ({ issues: many(issues) }));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, { fields: [issues.projectId], references: [projects.id] }),
  parent: one(issues, { fields: [issues.parentIssueId], references: [issues.key], relationName: 'parentChildren' }),
  children: many(issues, { relationName: 'parentChildren' }),
  assignee: one(users, { fields: [issues.assigneeId], references: [users.id], relationName: 'assignee' }),
  reporter: one(users, { fields: [issues.reporterId], references: [users.id], relationName: 'reporter' }),
  sprint: one(sprints, { fields: [issues.sprintId], references: [sprints.id] }),
  labels: many(issueLabels),
  comments: many(comments),
  customComments: many(issueComments),
  history: many(issueHistory),
  auditLogs: many(issueAuditLogs),
  attachments: many(attachments),
  subtasks: many(subtasks),
  gitLinks: many(issueGitLinks),
}));

export const issueCommentsRelations = relations(issueComments, ({ one }) => ({
  issue: one(issues, { fields: [issueComments.issueId], references: [issues.key] }),
  author: one(users, { fields: [issueComments.authorId], references: [users.id] }),
}));

export const issueAuditLogsRelations = relations(issueAuditLogs, ({ one }) => ({
  issue: one(issues, { fields: [issueAuditLogs.issueId], references: [issues.key] }),
  actor: one(users, { fields: [issueAuditLogs.actorId], references: [users.id] }),
}));

export const projectWorkflowStatusesRelations = relations(projectWorkflowStatuses, ({ one }) => ({
  project: one(projects, { fields: [projectWorkflowStatuses.projectId], references: [projects.id] }),
}));

export const workflowTransitionRulesRelations = relations(workflowTransitionRules, ({ one }) => ({
  project: one(projects, { fields: [workflowTransitionRules.projectId], references: [projects.id] }),
}));

export const issueGitLinksRelations = relations(issueGitLinks, ({ one }) => ({
  issue: one(issues, { fields: [issueGitLinks.issueId], references: [issues.key] }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  issue: one(issues, { fields: [subtasks.issueId], references: [issues.key] }),
}));

export const labelsRelations = relations(labels, ({ many }) => ({ issues: many(issueLabels) }));

export const issueLabelsRelations = relations(issueLabels, ({ one }) => ({
  issue: one(issues, { fields: [issueLabels.issueKey], references: [issues.key] }),
  label: one(labels, { fields: [issueLabels.labelId], references: [labels.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  issue: one(issues, { fields: [comments.issueKey], references: [issues.key] }),
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const issueHistoryRelations = relations(issueHistory, ({ one }) => ({
  issue: one(issues, { fields: [issueHistory.issueKey], references: [issues.key] }),
  actor: one(users, { fields: [issueHistory.actorId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  author: one(users, { fields: [documents.authorId], references: [users.id], relationName: 'author' }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  issue: one(issues, { fields: [attachments.issueKey], references: [issues.key] }),
  document: one(documents, { fields: [attachments.documentId], references: [documents.id] }),
  uploader: one(users, { fields: [attachments.uploadedById], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  author: one(users, { fields: [notifications.authorId], references: [users.id] }),
  issue: one(issues, { fields: [notifications.issueId], references: [issues.key] }),
}));


export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Swimlane = typeof swimlanes.$inferSelect;
export type NewSwimlane = typeof swimlanes.$inferInsert;
export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type HistoryEntry = typeof issueHistory.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Sprint = typeof sprints.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type IssueLink = typeof issueLinks.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type IssueComment = typeof issueComments.$inferSelect;
export type NewIssueComment = typeof issueComments.$inferInsert;
export type IssueAuditLog = typeof issueAuditLogs.$inferSelect;
export type NewIssueAuditLog = typeof issueAuditLogs.$inferInsert;
export type ProjectWorkflowStatus = typeof projectWorkflowStatuses.$inferSelect;
export type NewProjectWorkflowStatus = typeof projectWorkflowStatuses.$inferInsert;
export type WorkflowTransitionRule = typeof workflowTransitionRules.$inferSelect;
export type NewWorkflowTransitionRule = typeof workflowTransitionRules.$inferInsert;
export type IssueGitLink = typeof issueGitLinks.$inferSelect;
export type NewIssueGitLink = typeof issueGitLinks.$inferInsert;
