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

  const hasActiveFilters =
    filters.onlyMine ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedTypes.length > 0 ||
    filters.selectedAssignee !== 'ALL' ||
    filters.selectedEpic !== 'ALL' ||
    (filters.isJqlMode && Boolean(filters.jqlQuery.trim()));

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
      {/* Quick "My Issues" Filter */}
      <button
        onClick={toggleOnlyMine}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 ${
          filters.onlyMine
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/50'
            : 'bg-slate-100 dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#343C50]'
        }`}
        title="Show issues assigned to me"
      >
        <UserIcon className="w-3.5 h-3.5" />
        <span>My Issues</span>
        <span
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
            filters.onlyMine
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {myIssuesCount}
        </span>
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#232836] flex-shrink-0" />

      {/* Priority Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[
          { key: 'Critical', label: 'Critical', color: 'border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20' },
          { key: 'High', label: 'High', color: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' },
          { key: 'Medium', label: 'Med', color: 'border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20' },
          { key: 'Low', label: 'Low', color: 'border-slate-400/40 text-slate-600 dark:text-slate-400 bg-slate-500/10 hover:bg-slate-500/20' },
        ].map((item) => {
          const isActive = filters.selectedPriorities.includes(item.key);
          const count = priorityCounts[item.key] ?? 0;
          return (
            <button
              key={item.key}
              onClick={() => togglePriority(item.key)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400/40'
                  : `${item.color}`
              }`}
              title={`Filter by ${item.key} priority (${count} available)`}
            >
              <span>{item.label}</span>
              <span
                className={`font-mono text-[10px] px-1 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'opacity-70'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#232836] flex-shrink-0" />

      {/* Type Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[
          { key: 'Bug', icon: Bug, color: 'text-rose-500 dark:text-rose-400' },
          { key: 'Story', icon: Bookmark, color: 'text-emerald-500 dark:text-emerald-400' },
          { key: 'Task', icon: CircleDot, color: 'text-blue-500 dark:text-blue-400' },
          { key: 'Epic', icon: Zap, color: 'text-purple-500 dark:text-purple-400' },
        ].map((t) => {
          const isActive = filters.selectedTypes.includes(t.key);
          const Icon = t.icon;
          const count = typeCounts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              onClick={() => toggleType(t.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'border-cyan-500 bg-cyan-600 text-white shadow-xs ring-1 ring-cyan-400/40'
                  : 'border-slate-200 dark:border-[#232836] bg-slate-100 dark:bg-[#11141B] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#343C50]'
              }`}
              title={`Filter by ${t.key} type (${count} available)`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-white' : t.color}`} />
              <span>{t.key}</span>
              <span
                className={`font-mono text-[10px] px-1 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'opacity-70'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#232836] flex-shrink-0" />

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
                  ? 'ring-2 ring-cyan-400 scale-110 z-10'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              title={`Filter by ${u.name}`}
            >
              <UserAvatar user={u} size="xs" />
              {isActive && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-1 ring-black" />
              )}
            </button>
          );
        })}
      </div>

      {/* Clear Filters CTA */}
      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0 ml-1 active:scale-95"
          title="Clear all active filters"
        >
          <X className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

export default FilterRibbon;
