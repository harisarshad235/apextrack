'use client';

import React, { useState } from 'react';
import {
  Filter,
  Code,
  Search,
  Zap,
  X,
  Layers,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';
import { FullIssue, User, WorkspaceMetrics } from '@/lib/types';
import { FilterRibbon } from './FilterRibbon';

export interface BoardFiltersState {
  selectedTypes: string[];
  selectedPriorities: string[];
  selectedAssignee: string;
  selectedEpic: string;
  onlyMine: boolean;
  jqlQuery: string;
  isJqlMode: boolean;
}

interface BoardFiltersProps {
  filters: BoardFiltersState;
  onChangeFilters: (filters: BoardFiltersState) => void;
  users: User[];
  allIssues: FullIssue[];
  metrics: WorkspaceMetrics;
  currentUserId: string;
}

export function evaluateJqlLite(issue: FullIssue, currentUserId: string, query: string): boolean {
  if (!query.trim()) return true;

  const clauses = query.split(/\s+AND\s+/i);

  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^([a-zA-Z_]+)\s*(!=|<=|>=|=|>|<|~)\s*(.+)$/);
    if (!match) {
      const search = trimmed.toLowerCase();
      const inText =
        issue.key.toLowerCase().includes(search) ||
        issue.title.toLowerCase().includes(search) ||
        (issue.description && issue.description.toLowerCase().includes(search));
      if (!inText) return false;
      continue;
    }

    const field = match[1].toLowerCase();
    const op = match[2];
    let val = match[3].trim().replace(/^['"]|['"]$/g, '');

    if (val.toLowerCase() === 'currentuser()') {
      val = currentUserId;
    }

    if (field === 'assignee' || field === 'assigneeid') {
      const issueAssigneeId = issue.assigneeId || '';
      const issueAssigneeName = issue.assignee?.name?.toLowerCase() || '';
      const matchVal = val.toLowerCase();
      if (op === '=') {
        if (issueAssigneeId !== val && issueAssigneeName !== matchVal) return false;
      } else if (op === '!=') {
        if (issueAssigneeId === val || issueAssigneeName === matchVal) return false;
      }
    } else if (field === 'priority') {
      const issuePri = issue.priority.toLowerCase();
      const matchPri = val.toLowerCase();
      if (op === '=' && issuePri !== matchPri) return false;
      if (op === '!=' && issuePri === matchPri) return false;
    } else if (field === 'status') {
      const issueStat = issue.status.toLowerCase();
      const matchStat = val.toLowerCase();
      if (op === '=' && issueStat !== matchStat) return false;
      if (op === '!=' && issueStat === matchStat) return false;
    } else if (field === 'type' || field === 'issuetype') {
      const issueT1 = (issue.type || '').toLowerCase();
      const issueT2 = (issue.issueType || '').toLowerCase();
      const matchT = val.toLowerCase();
      const isMatch = issueT1 === matchT || issueT2 === matchT;
      if (op === '=' && !isMatch) return false;
      if (op === '!=' && isMatch) return false;
    } else if (field === 'points' || field === 'storypoints') {
      const pts = Number(issue.storyPoints) || 0;
      const numVal = Number(val);
      if (op === '=' && pts !== numVal) return false;
      if (op === '!=' && pts === numVal) return false;
      if (op === '>' && !(pts > numVal)) return false;
      if (op === '>=' && !(pts >= numVal)) return false;
      if (op === '<' && !(pts < numVal)) return false;
      if (op === '<=' && !(pts <= numVal)) return false;
    } else if (field === 'blocked' || field === 'isblocked') {
      const isBlocked = Boolean(
        issue.blockedByIssues &&
        issue.blockedByIssues.some((b) => b.status.toLowerCase() !== 'done')
      );
      const targetBool = val.toLowerCase() === 'true';
      if (op === '=' && isBlocked !== targetBool) return false;
      if (op === '!=' && isBlocked === targetBool) return false;
    } else if (field === 'epic' || field === 'parent') {
      const parentKey = issue.parentIssueId || issue.parent?.key || '';
      const matchKey = val.toUpperCase();
      if (op === '=' && parentKey.toUpperCase() !== matchKey) return false;
      if (op === '!=' && parentKey.toUpperCase() === matchKey) return false;
    } else if (field === 'text' || field === 'summary' || field === 'title') {
      const textVal = (issue.title + ' ' + (issue.description || '')).toLowerCase();
      const queryVal = val.toLowerCase();
      if ((op === '~' || op === '=') && !textVal.includes(queryVal)) return false;
    }
  }

  return true;
}

export function BoardFilters({
  filters,
  onChangeFilters,
  users,
  allIssues,
  metrics,
  currentUserId,
}: BoardFiltersProps) {
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const typeDropdownRef = React.useRef<HTMLDivElement>(null);
  const priorityDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setTypeDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setPriorityDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setTypeDropdownOpen(false);
        setPriorityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const epics = allIssues.filter(
    (i) => (i.issueType || i.type || '').toUpperCase() === 'EPIC'
  );

  const hasActiveFilters =
    filters.selectedTypes.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedAssignee !== 'ALL' ||
    filters.selectedEpic !== 'ALL' ||
    filters.onlyMine ||
    (filters.isJqlMode && Boolean(filters.jqlQuery.trim()));

  const handleReset = () => {
    setTypeDropdownOpen(false);
    setPriorityDropdownOpen(false);
    onChangeFilters({
      selectedTypes: [],
      selectedPriorities: [],
      selectedAssignee: 'ALL',
      selectedEpic: 'ALL',
      onlyMine: false,
      jqlQuery: '',
      isJqlMode: false,
    });
  };

  return (
    <div className="bg-white/80 dark:bg-[#11141B]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#232836] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-10 transition-colors">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {/* Quick Filter Ribbon */}
        <FilterRibbon
          filters={filters}
          onChangeFilters={onChangeFilters}
          users={users}
          allIssues={allIssues}
          currentUserId={currentUserId}
        />

        {/* JQL-lite Mode Toggle */}
        <button
          onClick={() => {
            setTypeDropdownOpen(false);
            setPriorityDropdownOpen(false);
            onChangeFilters({ ...filters, isJqlMode: !filters.isJqlMode });
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-[11px] font-semibold transition-all duration-150 active:scale-95 flex-shrink-0 cursor-pointer ${
            filters.isJqlMode
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white border-transparent shadow-xs'
              : 'bg-slate-100 dark:bg-[#171B24] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#232836] hover:border-[#343C50]'
          }`}
          title="Toggle Compound JQL-lite Search Syntax"
        >
          <Code className="w-3.5 h-3.5" />
          <span>JQL-lite</span>
        </button>

        {filters.isJqlMode && (
          <div className="flex-1 min-w-[280px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={filters.jqlQuery}
                onChange={(e) => onChangeFilters({ ...filters, jqlQuery: e.target.value })}
                placeholder="e.g. assignee = currentUser() AND priority = High AND status != Done"
                className="w-full bg-slate-100 dark:bg-[#0A0C10] border border-slate-200 dark:border-[#232836] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            {filters.jqlQuery && (
              <button
                onClick={() => onChangeFilters({ ...filters, jqlQuery: '' })}
                className="text-slate-400 hover:text-white p-1"
                title="Clear JQL query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Epic Filter (if any epics exist) */}
        {!filters.isJqlMode && epics.length > 0 && (
          <select
            value={filters.selectedEpic}
            onChange={(e) => onChangeFilters({ ...filters, selectedEpic: e.target.value })}
            className="bg-slate-100 dark:bg-[#171B24] border border-slate-200 dark:border-[#232836] rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Epics</option>
            {epics.map((ep) => (
              <option key={ep.key} value={ep.key}>
                {ep.key}: {ep.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Metrics Status Capsules */}
      <div className="hidden lg:flex items-center gap-2 text-xs flex-shrink-0">
        <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-[#0A0C10] border border-slate-200 dark:border-[#232836] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{metrics.total}</strong> Issues
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>
            <strong className="font-bold">{metrics.inProgress}</strong> Active
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>
            <strong className="font-bold">{metrics.completedPoints}</strong> pts done
          </span>
        </div>
      </div>
    </div>
  );
}

export default BoardFilters;
