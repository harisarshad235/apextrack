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
} from 'lucide-react';
import { FullIssue, User, WorkspaceMetrics } from '@/lib/types';

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
      const issueT = (issue.issueType || issue.type || '').toLowerCase();
      const matchT = val.toLowerCase();
      if (op === '=' && issueT !== matchT) return false;
      if (op === '!=' && issueT === matchT) return false;
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

  const allTypes = ['Epic', 'Story', 'Task', 'Bug', 'Subtask'];
  const allPriorities = ['Critical', 'High', 'Medium', 'Low', 'Lowest'];

  const toggleType = (t: string) => {
    const current = filters.selectedTypes;
    const next = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t];
    onChangeFilters({ ...filters, selectedTypes: next });
  };

  const togglePriority = (p: string) => {
    const current = filters.selectedPriorities;
    const next = current.includes(p)
      ? current.filter((x) => x !== p)
      : [...current, p];
    onChangeFilters({ ...filters, selectedPriorities: next });
  };

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
    <div className="bg-[#0f172a] dark:bg-[#0b0f17] border-b border-[#1e293b] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        <span className="text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-blue-400" /> Filters:
        </span>

        {/* JQL-lite Mode Toggle */}
        <button
          onClick={() => {
            setTypeDropdownOpen(false);
            setPriorityDropdownOpen(false);
            onChangeFilters({ ...filters, isJqlMode: !filters.isJqlMode });
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold transition flex-shrink-0 ${
            filters.isJqlMode
              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
              : 'bg-[#151c28] text-slate-300 border-[#263348] hover:border-slate-600'
          }`}
          title="Toggle Compound JQL-lite Search Syntax"
        >
          <Code className="w-3.5 h-3.5" />
          <span>JQL-lite</span>
        </button>

        {filters.isJqlMode ? (
          /* JQL-lite Query Input Bar */
          <div className="flex-1 min-w-[280px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={filters.jqlQuery}
                onChange={(e) => onChangeFilters({ ...filters, jqlQuery: e.target.value })}
                placeholder="e.g. assignee = currentUser() AND priority = High AND status != Done"
                className="w-full bg-[#151c28] border border-[#263348] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
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
        ) : (
          /* Standard Compound Dropdowns Toolbar */
          <>
            {/* Quick Toggle: Only My Issues */}
            <button
              onClick={() => onChangeFilters({ ...filters, onlyMine: !filters.onlyMine })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                filters.onlyMine
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-[#151c28] text-slate-300 border-[#263348] hover:border-slate-600'
              }`}
            >
              <Zap className="w-3 h-3" />
              Only My Issues
            </button>

            {/* Type Multi-select Dropdown */}
            <div ref={typeDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setPriorityDropdownOpen(false);
                  setTypeDropdownOpen(!typeDropdownOpen);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                  filters.selectedTypes.length > 0 || typeDropdownOpen
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'bg-[#151c28] text-slate-300 border-[#263348] hover:border-slate-600'
                }`}
              >
                <span>
                  Type {filters.selectedTypes.length > 0 ? `(${filters.selectedTypes.length})` : ''}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${typeDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              {typeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[170px] bg-[#111723] border border-[#263348] rounded-xl p-2 shadow-2xl space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#263348]/60 flex items-center justify-between mb-1">
                    <span>Issue Types</span>
                    {filters.selectedTypes.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeFilters({ ...filters, selectedTypes: [] });
                        }}
                        className="text-[10px] text-blue-400 hover:underline lowercase"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  {allTypes.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer text-slate-200 transition select-none"
                    >
                      <input
                        type="checkbox"
                        checked={filters.selectedTypes.includes(t)}
                        onChange={() => toggleType(t)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="whitespace-nowrap font-medium text-xs">{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Multi-select Dropdown */}
            <div ref={priorityDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setTypeDropdownOpen(false);
                  setPriorityDropdownOpen(!priorityDropdownOpen);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                  filters.selectedPriorities.length > 0 || priorityDropdownOpen
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'bg-[#151c28] text-slate-300 border-[#263348] hover:border-slate-600'
                }`}
              >
                <span>
                  Priority {filters.selectedPriorities.length > 0 ? `(${filters.selectedPriorities.length})` : ''}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${priorityDropdownOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>

              {priorityDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[170px] bg-[#111723] border border-[#263348] rounded-xl p-2 shadow-2xl space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#263348]/60 flex items-center justify-between mb-1">
                    <span>Priority Levels</span>
                    {filters.selectedPriorities.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChangeFilters({ ...filters, selectedPriorities: [] });
                        }}
                        className="text-[10px] text-blue-400 hover:underline lowercase"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  {allPriorities.map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-800/80 rounded-lg cursor-pointer text-slate-200 transition select-none"
                    >
                      <input
                        type="checkbox"
                        checked={filters.selectedPriorities.includes(p)}
                        onChange={() => togglePriority(p)}
                        className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="whitespace-nowrap font-medium text-xs">{p}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Assignee Selector */}
            <select
              value={filters.selectedAssignee}
              onChange={(e) => onChangeFilters({ ...filters, selectedAssignee: e.target.value })}
              className="bg-[#151c28] border border-[#263348] rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Epic Filter */}
            {epics.length > 0 && (
              <select
                value={filters.selectedEpic}
                onChange={(e) => onChangeFilters({ ...filters, selectedEpic: e.target.value })}
                className="bg-[#151c28] border border-[#263348] rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">All Epics</option>
                {epics.map((ep) => (
                  <option key={ep.key} value={ep.key}>
                    {ep.key}: {ep.title}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-blue-400 hover:text-blue-300 text-xs hover:underline flex items-center gap-1 ml-1"
          >
            <X className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Metrics Counter */}
      <div className="flex items-center gap-4 text-slate-400 flex-shrink-0 text-xs">
        <div>
          <span className="font-bold text-white">{metrics.total}</span> Issues
        </div>
        <div>
          <span className="font-bold text-blue-400">{metrics.inProgress}</span> In Dev
        </div>
        <div>
          <span className="font-bold text-emerald-400">{metrics.completedPoints}</span> pts done
        </div>
      </div>
    </div>
  );
}
