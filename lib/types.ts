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
};

export interface FullIssue extends Issue {
  labels: string[];
  comments: (Comment & { author?: User | null })[];
  history: HistoryEntry[];
  attachments: Attachment[];
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
