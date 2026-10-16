import {
  Bug,
  Bookmark,
  Layers,
  CircleDot,
  LucideIcon,
  CheckCircle2,
} from 'lucide-react';
import { IssueType, IssuePriority, IssueStatus } from '@/db/schema';

export interface ColumnConfig {
  id: IssueStatus;
  label: string;
  color: string;
  badgeColor: string;
  dotColor: string;
}

export const COLUMNS: ColumnConfig[] = [
  {
    id: 'To Do',
    label: 'To Do',
    color: 'border-slate-200/90 dark:border-slate-800/80 bg-slate-100/70 dark:bg-[#0E1420]/90',
    badgeColor: 'bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300/60 dark:border-slate-700',
    dotColor: 'bg-slate-400 dark:bg-slate-400',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    color: 'border-slate-200/90 dark:border-slate-800/80 bg-slate-100/70 dark:bg-[#0E1420]/90',
    badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'In Review',
    label: 'In Review',
    color: 'border-slate-200/90 dark:border-slate-800/80 bg-slate-100/70 dark:bg-[#0E1420]/90',
    badgeColor: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-800/60',
    dotColor: 'bg-indigo-500',
  },
  {
    id: 'Done',
    label: 'Done',
    color: 'border-slate-200/90 dark:border-slate-800/80 bg-slate-100/70 dark:bg-[#0E1420]/90',
    badgeColor: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
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
          'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
      };
    case 'Story':
      return {
        icon: Bookmark,
        color:
          'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
      };
    case 'Epic':
      return {
        icon: Layers,
        color:
          'text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50',
      };
    case 'Subtask':
      return {
        icon: CheckCircle2,
        color:
          'text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50',
      };
    case 'Task':
    default:
      return {
        icon: CircleDot,
        color:
          'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50',
      };
  }
};

export interface PriorityConfig {
  color: string;
  icon: string;
  label: string;
}

export const getPriorityConfig = (priority: IssuePriority | string): PriorityConfig => {
  switch (priority) {
    case 'Critical':
      return {
        color:
          'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 font-semibold',
        icon: 'Critical',
        label: 'Critical',
      };
    case 'High':
      return {
        color:
          'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 font-semibold',
        icon: 'High',
        label: 'High',
      };
    case 'Medium':
      return {
        color:
          'text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 font-medium',
        icon: 'Medium',
        label: 'Medium',
      };
    case 'Low':
      return {
        color:
          'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 font-medium',
        icon: 'Low',
        label: 'Low',
      };
    case 'Lowest':
    default:
      return {
        color:
          'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 font-normal',
        icon: 'Lowest',
        label: 'Lowest',
      };
  }
};
