'use client';

import React from 'react';
import {
  User as UserIcon,
  Filter,
  X,
  Sparkles,
  Bug,
  Bookmark,
  CircleDot,
  Layers,
  Flame,
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

  const hasActiveFilters =
    filters.onlyMine ||
    filters.selectedPriorities.length > 0 ||
    filters.selectedTypes.length > 0 ||
    filters.selectedAssignee !== 'ALL';

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 text-xs">
      {/* Quick "My Issues" Filter */}
      <button
        onClick={toggleOnlyMine}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 cursor-pointer flex-shrink-0 ${
          filters.onlyMine
            ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-500/20'
            : 'bg-slate-100 dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] text-slate-600 dark:text-slate-300 hover:border-[#343C50]'
        }`}
      >
        <UserIcon className="w-3.5 h-3.5" />
        <span>My Issues</span>
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#232836] flex-shrink-0" />

      {/* Priority Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[
          { key: 'Critical', label: 'Critical', color: 'border-rose-500/40 text-rose-500 bg-rose-500/10' },
          { key: 'High', label: 'High', color: 'border-amber-500/40 text-amber-500 bg-amber-500/10' },
          { key: 'Medium', label: 'Med', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
        ].map((item) => {
          const isActive = filters.selectedPriorities.includes(item.key);
          return (
            <button
              key={item.key}
              onClick={() => togglePriority(item.key)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-xs'
                  : `${item.color} hover:brightness-110`
              }`}
            >
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#232836] flex-shrink-0" />

      {/* Type Chips */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {[
          { key: 'Bug', icon: Bug, color: 'text-rose-400' },
          { key: 'Story', icon: Bookmark, color: 'text-emerald-400' },
          { key: 'Task', icon: CircleDot, color: 'text-indigo-400' },
        ].map((t) => {
          const isActive = filters.selectedTypes.includes(t.key);
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => toggleType(t.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-cyan-500 bg-cyan-600 text-white shadow-xs'
                  : 'border-slate-200 dark:border-[#232836] bg-slate-100 dark:bg-[#11141B] text-slate-600 dark:text-slate-300 hover:border-[#343C50]'
              }`}
            >
              <Icon className={`w-3 h-3 ${isActive ? 'text-white' : t.color}`} />
              <span>{t.key}</span>
            </button>
          );
        })}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#232836] flex-shrink-0" />

      {/* Assignee Avatar Ribbon */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {users.slice(0, 6).map((u) => {
          const isActive = filters.selectedAssignee === u.id;
          return (
            <button
              key={u.id}
              onClick={() => setAssignee(u.id)}
              className={`relative rounded-full transition-transform cursor-pointer ${
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
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0 ml-1"
        >
          <X className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

export default FilterRibbon;
