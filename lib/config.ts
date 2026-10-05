import {
  Bug,
  Bookmark,
  Layers,
  CircleDot,
  LucideIcon,
} from 'lucide-react';
import { IssueType, IssuePriority, IssueStatus } from '@/db/schema';

export interface ColumnConfig {
  id: IssueStatus;
  label: string;
  color: string;
}

export const COLUMNS: ColumnConfig[] = [
  {
    id: 'To Do',
    label: 'To Do',
    color: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
  },
  {
    id: 'In Review',
    label: 'In Review',
    color: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20',
  },
  {
    id: 'Done',
    label: 'Done',
    color: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
  },
];

export interface TypeConfig {
  icon: LucideIcon;
  color: string;
}

export const getTypeConfig = (type: IssueType | string): TypeConfig => {
  switch (type) {
    case 'Bug':
      return {
        icon: Bug,
        color:
          'text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
      };
    case 'Story':
      return {
        icon: Bookmark,
        color:
          'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
      };
    case 'Epic':
      return {
        icon: Layers,
        color:
          'text-purple-600 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
      };
    case 'Task':
    default:
      return {
        icon: CircleDot,
        color:
          'text-blue-600 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
      };
  }
};

export interface PriorityConfig {
  color: string;
  icon: string;
}

export const getPriorityConfig = (priority: IssuePriority | string): PriorityConfig => {
  switch (priority) {
    case 'Critical':
      return {
        color:
          'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 font-semibold',
        icon: '▲▲',
      };
    case 'High':
      return {
        color:
          'text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60',
        icon: '▲',
      };
    case 'Medium':
      return {
        color:
          'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60',
        icon: '■',
      };
    case 'Low':
      return {
        color:
          'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60',
        icon: '▼',
      };
    case 'Lowest':
    default:
      return {
        color:
          'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
        icon: '▼▼',
      };
  }
};
