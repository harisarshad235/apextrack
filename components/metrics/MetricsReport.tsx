'use client';

import React, { useMemo } from 'react';
import { FullIssue, User, WorkspaceMetrics } from '@/lib/types';

interface MetricsReportViewProps {
  issues: FullIssue[];
  users: User[];
  metrics: WorkspaceMetrics;
}

export function MetricsReportView({
  issues,
  users,
  metrics,
}: MetricsReportViewProps) {
  // Workload distribution per member
  const workloadByMember = useMemo(() => {
    return users.map((user) => {
      const assigned = issues.filter((i) => i.assigneeId === user.id);
      const points = assigned.reduce(
        (acc, curr) => acc + (Number(curr.storyPoints) || 0),
        0
      );
      return {
        ...user,
        issueCount: assigned.length,
        points,
      };
    });
  }, [issues, users]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Completion Rate
          </span>
          <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.completionRate}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.completed} of {metrics.total} tickets resolved
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Velocity Points
          </span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {metrics.completedPoints}{' '}
            <span className="text-sm font-normal text-slate-400">
              / {metrics.totalPoints} pts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Sprint commitment target</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active In Flight
          </span>
          <div className="text-3xl font-bold text-amber-500 mt-1">
            {metrics.inProgress}
          </div>
          <p className="text-xs text-slate-500 mt-1">Currently in progress across team</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Open Defect Count
          </span>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
            {metrics.openBugs}
          </div>
          <p className="text-xs text-slate-500 mt-1">Unresolved bug reports</p>
        </div>
      </div>

      {/* Workload Distribution Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          Engineer Workload & Story Point Allocation
        </h3>
        <div className="space-y-4">
          {workloadByMember.map((member) => {
            const maxEstimate = 20;
            const percentage = Math.min(
              100,
              Math.round((member.points / maxEstimate) * 100)
            );

            return (
              <div key={member.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        member.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                      }
                      alt={member.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {member.name}
                    </span>
                    <span className="text-slate-400">
                      ({member.department || 'Engineering'})
                    </span>
                  </div>
                  <div className="font-mono text-slate-600 dark:text-slate-300">
                    <span className="font-bold">{member.points} pts</span> •{' '}
                    {member.issueCount} issues
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      percentage > 85
                        ? 'bg-red-500'
                        : percentage > 50
                        ? 'bg-blue-600'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
