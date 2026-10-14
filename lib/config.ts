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
    color: 'border-slate-200 dark:border-[#232836] bg-slate-100/60 dark:bg-[#11141B]/70',
    badgeColor: 'bg-slate-200 text-slate-800 dark:bg-[#171B24] dark:text-slate-300 dark:border dark:border-[#232836]',
    dotColor: 'bg-slate-400 dark:bg-slate-500',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    color: 'border-amber-400/40 dark:border-amber-500/30 bg-amber-50/30 dark:bg-[#11141B]/80',
    badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30',
    dotColor: 'bg-[#F59E0B]',
  },
  {
    id: 'In Review',
    label: 'In Review',
    color: 'border-indigo-400/40 dark:border-indigo-500/30 bg-indigo-50/30 dark:bg-[#11141B]/80',
    badgeColor: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30',
    dotColor: 'bg-[#6366F1]',
  },
  {
    id: 'Done',
    label: 'Done',
    color: 'border-emerald-400/40 dark:border-emerald-500/30 bg-emerald-50/30 dark:bg-[#11141B]/80',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30',
    dotColor: 'bg-[#10B981]',
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
          'text-[#F43F5E] bg-rose-500/10 border-rose-500/30 dark:text-rose-400',
      };
    case 'Story':
      return {
        icon: Bookmark,
        color:
          'text-[#10B981] bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400',
      };
    case 'Epic':
      return {
        icon: Layers,
        color:
          'text-[#8B5CF6] bg-purple-500/10 border-purple-500/30 dark:text-purple-400',
      };
    case 'Subtask':
      return {
        icon: CheckCircle2,
        color:
          'text-[#06B6D4] bg-cyan-500/10 border-cyan-500/30 dark:text-cyan-400',
      };
    case 'Task':
    default:
      return {
        icon: CircleDot,
        color:
          'text-[#6366F1] bg-indigo-500/10 border-indigo-500/30 dark:text-indigo-400',
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
          'text-rose-700 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 font-bold',
        icon: '▲▲',
        label: 'Critical',
      };
    case 'High':
      return {
        color:
          'text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 font-semibold',
        icon: '▲',
        label: 'High',
      };
    case 'Medium':
      return {
        color:
          'text-indigo-700 dark:text-indigo-400 bg-indigo-500/15 border border-indigo-500/30',
        icon: '■',
        label: 'Medium',
      };
    case 'Low':
      return {
        color:
          'text-cyan-700 dark:text-cyan-400 bg-cyan-500/15 border border-cyan-500/30',
        icon: '▼',
        label: 'Low',
      };
    case 'Lowest':
    default:
      return {
        color:
          'text-slate-600 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20',
        icon: '▼▼',
        label: 'Lowest',
      };
  }
};
