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
  Check,
} from 'lucide-react';
import { FullIssue, User, WorkspaceMetrics } from '@/lib/types';
import { FilterRibbon } from './FilterRibbon';

const PRIORITIES = [
  { key: 'Critical', label: 'Critical', dotColor: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
  { key: 'High', label: 'High', dotColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  { key: 'Medium', label: 'Medium', dotColor: 'bg-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'Low', label: 'Low', dotColor: 'bg-slate-400', textColor: 'text-slate-600 dark:text-slate-400' },
] as const;

export interface BoardFiltersState {
  selectedTypes: string[];
  selectedPriorities: string[];
  selectedAssignee: string;
  selectedEpic: string;
  selectedEnvironment?: 'ALL' | 'LIVE' | 'DEMO';
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

  const priorityCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    for (const issue of allIssues) {
      const p = (issue.priority || '').toLowerCase();
      if (p === 'critical') counts.Critical++;
      else if (p === 'high') counts.High++;
      else if (p === 'medium' || p === 'med') counts.Medium++;
      else if (p === 'low' || p === 'lowest') counts.Low++;
    }
    return counts;
  }, [allIssues]);

  const hasActiveFilters =
    filters.selectedTypes.length > 0 ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedAssignee !== 'ALL' ||
    filters.selectedEpic !== 'ALL' ||
    (filters.selectedEnvironment && filters.selectedEnvironment !== 'ALL') ||
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
      selectedEnvironment: 'ALL',
      onlyMine: false,
      jqlQuery: '',
      isJqlMode: false,
    });
  };

  return (
    <div className="relative z-20 bg-white/95 dark:bg-[#0D121D]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {/* Quick Filter Ribbon */}
        <FilterRibbon
          filters={filters}
          onChangeFilters={onChangeFilters}
          users={users}
          allIssues={allIssues}
          currentUserId={currentUserId}
        />

        {/* Priority Filter Dropdown */}
        {!filters.isJqlMode && (
          <div className="relative z-30" ref={priorityDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setTypeDropdownOpen(false);
                setPriorityDropdownOpen(!priorityDropdownOpen);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                filters.selectedPriorities.length > 0
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
              }`}
              title="Filter by issue priority"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>
                {filters.selectedPriorities.length === 0
                  ? 'Priority'
                  : filters.selectedPriorities.length === 1
                  ? `Priority: ${filters.selectedPriorities[0]}`
                  : `Priority (${filters.selectedPriorities.length})`}
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  priorityDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {priorityDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-52 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                    Priorities
                  </span>
                  {filters.selectedPriorities.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChangeFilters({ ...filters, selectedPriorities: [] })
                      }
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  {PRIORITIES.map((pri) => {
                    const isSelected = filters.selectedPriorities.includes(pri.key);
                    const count = priorityCounts[pri.key] ?? 0;
                    return (
                      <button
                        key={pri.key}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? filters.selectedPriorities.filter((p) => p !== pri.key)
                            : [...filters.selectedPriorities, pri.key];
                          onChangeFilters({ ...filters, selectedPriorities: next });
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] transition-colors ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900'
                                : 'border-slate-300 dark:border-slate-600 bg-transparent'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${pri.dotColor}`} />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{pri.label}</span>
                        </div>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* JQL-lite Mode Toggle */}
        <button
          onClick={() => {
            setTypeDropdownOpen(false);
            setPriorityDropdownOpen(false);
            onChangeFilters({ ...filters, isJqlMode: !filters.isJqlMode });
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-mono text-[11px] font-semibold transition-all duration-150 active:scale-95 flex-shrink-0 cursor-pointer ${
            filters.isJqlMode
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
              : 'bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/70 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
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
                className="w-full bg-white dark:bg-[#090D16] border border-slate-200/90 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {filters.jqlQuery && (
              <button
                onClick={() => onChangeFilters({ ...filters, jqlQuery: '' })}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
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
            className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
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
        <div className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono text-[11px] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{metrics.total}</strong> Issues
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 flex items-center gap-1.5 font-mono text-[11px] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          <span>
            <strong className="font-bold">{metrics.inProgress}</strong> Active
          </span>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-mono text-[11px] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>
            <strong className="font-bold">{metrics.completedPoints}</strong> pts done
          </span>
        </div>
      </div>
    </div>
  );
}

export default BoardFilters;
