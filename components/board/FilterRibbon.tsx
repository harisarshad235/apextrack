'use client';

import React, { useMemo } from 'react';
import {
  User as UserIcon,
  X,
  Bug,
  Bookmark,
  CircleDot,
  Zap,
} from 'lucide-react';
import { User, FullIssue } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { BoardFiltersState } from './BoardFilters';

export interface FilterRibbonProps {
  filters: BoardFiltersState;
  onChangeFilters: (filters: BoardFiltersState) => void;
  users: User[];
  allIssues: FullIssue[];
  currentUserId: string;
}

export function FilterRibbon({
  filters,
  onChangeFilters,
  users,
  allIssues,
  currentUserId,
}: FilterRibbonProps) {
  const toggleOnlyMine = () => {
    onChangeFilters({
      ...filters,
      onlyMine: !filters.onlyMine,
    });
  };

  const togglePriority = (priority: string) => {
    const isSelected = filters.selectedPriorities.includes(priority);
    const next = isSelected
      ? filters.selectedPriorities.filter((p) => p !== priority)
      : [...filters.selectedPriorities, priority];
    onChangeFilters({
      ...filters,
      selectedPriorities: next,
    });
  };

  const toggleType = (type: string) => {
    const isSelected = filters.selectedTypes.includes(type);
    const next = isSelected
      ? filters.selectedTypes.filter((t) => t !== type)
      : [...filters.selectedTypes, type];
    onChangeFilters({
      ...filters,
      selectedTypes: next,
    });
  };

  const setAssignee = (userId: string) => {
    const next = filters.selectedAssignee === userId ? 'ALL' : userId;
    onChangeFilters({
      ...filters,
      selectedAssignee: next,
    });
  };

  const clearAll = () => {
    onChangeFilters({
      ...filters,
      selectedTypes: [],
      selectedPriorities: [],
      selectedAssignee: 'ALL',
      selectedEpic: 'ALL',
      onlyMine: false,
      jqlQuery: '',
      isJqlMode: false,
    });
  };

  // Counts by priority across all issues
  const priorityCounts = useMemo(() => {
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

  // Counts by type across all issues (checks both type and issueType)
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Bug: 0,
      Story: 0,
      Task: 0,
      Epic: 0,
    };
    for (const issue of allIssues) {
      const t1 = (issue.type || '').toLowerCase();
      const t2 = (issue.issueType || '').toLowerCase();
      if (t1 === 'bug' || t2 === 'bug') counts.Bug++;
      else if (t1 === 'story' || t2 === 'story') counts.Story++;
      else if (t1 === 'task' || t2 === 'task') counts.Task++;
      else if (t1 === 'epic' || t2 === 'epic') counts.Epic++;
    }
    return counts;
  }, [allIssues]);

  const myIssuesCount = useMemo(() => {
    return allIssues.filter((i) => i.assigneeId === currentUserId).length;
  }, [allIssues, currentUserId]);

  const toggleEnvironment = (env: 'LIVE' | 'DEMO') => {
    const next = filters.selectedEnvironment === env ? 'ALL' : env;
    onChangeFilters({
      ...filters,
      selectedEnvironment: next,
    });
  };

  const envCounts = useMemo(() => {
    let live = 0;
    let demo = 0;
    for (const issue of allIssues) {
      const isDemo =
        (issue.environment || '').toUpperCase() === 'DEMO' ||
        issue.labels?.some((l) => l.toLowerCase() === 'demo');
      if (isDemo) demo++;
      else live++;
    }
    return { live, demo };
  }, [allIssues]);

  const hasActiveFilters =
    filters.onlyMine ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedTypes.length > 0 ||
    (filters.selectedEnvironment && filters.selectedEnvironment !== 'ALL') ||
    filters.selectedAssignee !== 'ALL' ||
    filters.selectedEpic !== 'ALL' ||
    (filters.isJqlMode && Boolean(filters.jqlQuery.trim()));

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
      {/* Quick "My Issues" Filter */}
      <button
        onClick={toggleOnlyMine}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 cursor-pointer flex-shrink-0 active:scale-95 ${
          filters.onlyMine
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border border-slate-900 dark:border-white shadow-xs'
            : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172134] hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
        }`}
        title="Show issues assigned to me"
      >
        <UserIcon className="w-3.5 h-3.5" />
        <span>My Issues</span>
        <span
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
            filters.onlyMine
              ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {myIssuesCount}
        </span>
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

      {/* Priority Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[
          { key: 'Critical', label: 'Critical', dot: 'bg-rose-500' },
          { key: 'High', label: 'High', dot: 'bg-amber-500' },
          { key: 'Medium', label: 'Med', dot: 'bg-indigo-400' },
          { key: 'Low', label: 'Low', dot: 'bg-slate-400' },
        ].map((item) => {
          const isActive = filters.selectedPriorities.includes(item.key);
          const count = priorityCounts[item.key] ?? 0;
          return (
            <button
              key={item.key}
              onClick={() => togglePriority(item.key)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172134] hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
              }`}
              title={`Filter by ${item.key} priority (${count} available)`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
              <span>{item.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

      {/* Type Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[
          { key: 'Bug', icon: Bug, iconColor: 'text-rose-500' },
          { key: 'Story', icon: Bookmark, iconColor: 'text-emerald-500' },
          { key: 'Task', icon: CircleDot, iconColor: 'text-blue-500' },
          { key: 'Epic', icon: Zap, iconColor: 'text-purple-500' },
        ].map((t) => {
          const isActive = filters.selectedTypes.includes(t.key);
          const Icon = t.icon;
          const count = typeCounts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => toggleType(t.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172134] hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
              }`}
              title={`Filter by ${t.key} type (${count} available)`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-current' : t.iconColor}`} />
              <span>{t.key}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

      {/* Live / Demo Environment Filter Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => toggleEnvironment('LIVE')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
            filters.selectedEnvironment === 'LIVE'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
          }`}
          title={`Filter by Live Issues (${envCounts.live} available)`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Live</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
              filters.selectedEnvironment === 'LIVE'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {envCounts.live}
          </span>
        </button>

        <button
          onClick={() => toggleEnvironment('DEMO')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-150 cursor-pointer active:scale-95 ${
            filters.selectedEnvironment === 'DEMO'
              ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#172134] shadow-2xs'
          }`}
          title={`Filter by Demo Issues (${envCounts.demo} available)`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>Demo</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
              filters.selectedEnvironment === 'DEMO'
                ? 'bg-white/20 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {envCounts.demo}
          </span>
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 flex-shrink-0" />

      {/* Assignee Avatar Ribbon */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {users.slice(0, 8).map((u) => {
          const isActive = filters.selectedAssignee === u.id;
          return (
            <button
              key={u.id}
              onClick={() => setAssignee(u.id)}
              className={`relative rounded-full transition-all cursor-pointer ${
                isActive
                  ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 scale-110 z-10'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              title={`Filter by ${u.name}`}
            >
              <UserAvatar user={u} size="xs" />
              {isActive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-500 ring-1 ring-white dark:ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Clear Filters CTA */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0 ml-1 active:scale-95"
          title="Clear all active filters"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

export default FilterRibbon;
