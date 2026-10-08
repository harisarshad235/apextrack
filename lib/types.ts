import {
  User,
  Project,
  Swimlane,
  ProjectStatus,
  Issue,
  Comment,
  HistoryEntry,
  Document,
  Attachment,
  Sprint,
  UserRole,
  UserStatus,
  IssueType,
  IssuePriority,
  IssueStatus,
  Subtask,
  IssueLink,
  Notification as AppNotification,
  IssueComment,
  IssueAuditLog,
  ProjectWorkflowStatus,
  WorkflowTransitionRule,
  IssueGitLink,
  JiraIssueType,
  WorkflowCategory,
  EnterpriseLinkType,
} from '@/db/schema';

export type {
  User,
  Project,
  Swimlane,
  ProjectStatus,
  Issue,
  Comment,
  HistoryEntry,
  Document,
  Attachment,
  Sprint,
  UserRole,
  UserStatus,
  IssueType,
  IssuePriority,
  IssueStatus,
  Subtask,
  IssueLink,
  AppNotification,
  IssueComment,
  IssueAuditLog,
  ProjectWorkflowStatus,
  WorkflowTransitionRule,
  IssueGitLink,
  JiraIssueType,
  WorkflowCategory,
  EnterpriseLinkType,
};

export interface FullIssue extends Issue {
  labels: string[];
  comments: (Comment & { author?: User | null })[];
  customComments?: (IssueComment & { author?: User | null })[];
  history: HistoryEntry[];
  auditLogs?: IssueAuditLog[];
  attachments: Attachment[];
  subtasks: Subtask[];
  links: IssueLink[];
  gitLinks?: IssueGitLink[];
  parent?: FullIssue | null;
  children?: FullIssue[];
  blockedByIssues?: FullIssue[];
  blockingIssues?: FullIssue[];
  assignee?: User | null;
  reporter?: User | null;
  sprint?: Sprint | null;
  project?: Project | null;
}

export interface FullDocument extends Document {
  author?: User | null;
  attachments: Attachment[];
}

export interface WorkspaceMetrics {
  total: number;
  completed: number;
  inProgress: number;
  openBugs: number;
  totalPoints: number;
  completedPoints: number;
  completionRate: number;
}

