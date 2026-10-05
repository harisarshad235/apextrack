'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import { User, WorkspaceMetrics } from '@/lib/types';

interface FilterBarProps {
  filterType: string;
  setFilterType: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterAssignee: string;
  setFilterAssignee: (val: string) => void;
  users: User[];
  metrics: WorkspaceMetrics;
}

export function FilterBar({
  filterType,
  setFilterType,
  filterPriority,
  setFilterPriority,
  filterAssignee,
  setFilterAssignee,
  users,
  metrics,
}: FilterBarProps) {
  const hasActiveFilters =
    filterType !== 'ALL' || filterPriority !== 'ALL' || filterAssignee !== 'ALL';

  return (
    <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <span className="text-slate-400 font-medium flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filters:
        </span>

        {/* Type selector */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Types</option>
          <option value="Story">Story</option>
          <option value="Bug">Bug</option>
          <option value="Task">Task</option>
          <option value="Epic">Epic</option>
        </select>

        {/* Priority selector */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Lowest">Lowest</option>
        </select>

        {/* Assignee selector */}
        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setFilterType('ALL');
              setFilterPriority('ALL');
              setFilterAssignee('ALL');
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline px-1"
          >
            Reset
          </button>
        )}
      </div>

      {/* Jira Sprint Pulse Metrics */}
      <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {metrics.total}
          </span>
          <span>Issues</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {metrics.inProgress}
          </span>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {metrics.openBugs}
          </span>
          <span>Open Bugs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {metrics.completedPoints} pts
          </span>
          <span>Burned</span>
        </div>
      </div>
    </div>
  );
}
