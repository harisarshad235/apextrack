'use client';

import React, { useMemo } from 'react';
import { FullIssue, User, WorkspaceMetrics, Sprint } from '@/lib/types';

interface MetricsReportViewProps {
  issues: FullIssue[];
  users: User[];
  metrics: WorkspaceMetrics;
  sprints?: Sprint[];
}

const DAY_MS = 86400000;

function BurndownChart({ issues, sprints }: { issues: FullIssue[]; sprints: Sprint[] }) {
  const sprint = sprints.find((s) => s.state === 'active') || sprints.find((s) => s.state === 'upcoming');

  const data = useMemo(() => {
    if (!sprint?.startDate || !sprint?.endDate) return null;
    const start = new Date(sprint.startDate).getTime();
    const end = new Date(sprint.endDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return null;

    const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
    const committed = sprintIssues.reduce((a, i) => a + (Number(i.storyPoints) || 0), 0);

    // Completion time: latest history entry moving the issue to Done (fallback: updatedAt)
    const doneAt = sprintIssues
      .filter((i) => i.status === 'Done')
      .map((i) => {
        const h = i.history
          .filter((x) => x.field === 'status' && x.toValue === 'Done')
          .map((x) => new Date(x.createdAt).getTime());
        return {
          pts: Number(i.storyPoints) || 0,
          at: h.length ? Math.max(...h) : new Date(i.updatedAt).getTime(),
        };
      });

    const days = Math.max(1, Math.round((end - start) / DAY_MS));
    const today = Date.now();
    const ideal: number[] = [];
    const actual: (number | null)[] = [];
    for (let d = 0; d <= days; d++) {
      ideal.push(committed - (committed * d) / days);
      const dayEnd = start + (d + 1) * DAY_MS - 1;
      if (start + d * DAY_MS > today) {
        actual.push(null);
      } else {
        const burned = doneAt.filter((x) => x.at <= dayEnd).reduce((a, x) => a + x.pts, 0);
        actual.push(Math.max(0, committed - burned));
      }
    }
    return { committed, days, ideal, actual, name: sprint.name };
  }, [issues, sprint]);

  const W = 640;
  const H = 240;
  const pad = { l: 40, r: 16, t: 16, b: 28 };

  if (!data) {
    return (
      <p className="text-xs text-slate-400 italic">
        No sprint with start and end dates available to plot a burndown.
      </p>
    );
  }

  const maxY = Math.max(data.committed, 1);
  const x = (d: number) => pad.l + (d / data.days) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxY) * (H - pad.t - pad.b);
  const idealPath = data.ideal.map((v, d) => `${d === 0 ? 'M' : 'L'}${x(d)},${y(v)}`).join(' ');
  const actualPoints = data.actual
    .map((v, d) => (v === null ? null : { d, v }))
    .filter((p): p is { d: number; v: number } => p !== null);
  const actualPath = actualPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.d)},${y(p.v)}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{data.name}</span>
        <div className="flex items-center gap-4 text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-slate-400" /> Ideal Burn
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-blue-600" /> Actual Burn
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Sprint burndown chart">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(maxY * t)}
              y2={y(maxY * t)}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={1}
            />
            <text x={pad.l - 6} y={y(maxY * t) + 3} textAnchor="end" className="fill-slate-400" fontSize={10}>
              {Math.round(maxY * t)}
            </text>
          </g>
        ))}
        {[0, Math.floor(data.days / 2), data.days].map((d) => (
          <text key={d} x={x(d)} y={H - 8} textAnchor="middle" className="fill-slate-400" fontSize={10}>
            Day {d}
          </text>
        ))}
        <path d={idealPath} fill="none" className="stroke-slate-400" strokeWidth={2} strokeDasharray="6 4" />
        {actualPath && (
          <path d={actualPath} fill="none" className="stroke-blue-600" strokeWidth={2.5} strokeLinejoin="round" />
        )}
        {actualPoints.map((p) => (
          <circle key={p.d} cx={x(p.d)} cy={y(p.v)} r={3} className="fill-blue-600" />
        ))}
      </svg>
    </div>
  );
}

export function MetricsReportView({
  issues,
  users,
  metrics,
  sprints = [],
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

      {/* Sprint Burndown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          Sprint Burndown (Story Points Remaining)
        </h3>
        <BurndownChart issues={issues} sprints={sprints} />
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
