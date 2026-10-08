'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  BarChart3,
  TrendingDown,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { FullIssue, User, WorkspaceMetrics, Sprint } from '@/lib/types';

interface MetricsReportViewProps {
  issues: FullIssue[];
  users: User[];
  metrics: WorkspaceMetrics;
  sprints?: Sprint[];
}

const DAY_MS = 86400000;

export function MetricsReportView({
  issues,
  users,
  metrics,
  sprints = [],
}: MetricsReportViewProps) {
  const [activeReportTab, setActiveReportTab] = useState<'burndown' | 'velocity' | 'cfd'>('burndown');

  // Active / selected sprint for burndown
  const activeOrLatestSprint = useMemo(() => {
    return (
      sprints.find((s) => s.state === 'active') ||
      sprints.find((s) => s.state === 'upcoming') ||
      sprints[0] ||
      null
    );
  }, [sprints]);

  const [selectedSprintId, setSelectedSprintId] = useState<string>(
    activeOrLatestSprint?.id || ''
  );

  const selectedSprint = useMemo(() => {
    return sprints.find((s) => s.id === selectedSprintId) || activeOrLatestSprint;
  }, [sprints, selectedSprintId, activeOrLatestSprint]);

  // Burndown Data Calculation
  const burndownData = useMemo(() => {
    if (!selectedSprint?.startDate || !selectedSprint?.endDate) return [];
    const start = new Date(selectedSprint.startDate).getTime();
    const end = new Date(selectedSprint.endDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return [];

    const sprintIssues = issues.filter((i) => i.sprintId === selectedSprint.id);
    const totalCommitted = sprintIssues.reduce(
      (acc, i) => acc + (Number(i.storyPoints) || 0),
      0
    );

    const doneItems = sprintIssues
      .filter((i) => i.status.toLowerCase() === 'done')
      .map((i) => {
        const historyDone = (i.history || [])
          .filter((h) => h.field === 'status' && h.toValue?.toLowerCase() === 'done')
          .map((h) => new Date(h.createdAt).getTime());
        return {
          pts: Number(i.storyPoints) || 0,
          at: historyDone.length ? Math.max(...historyDone) : new Date(i.updatedAt).getTime(),
        };
      });

    const totalDays = Math.max(1, Math.round((end - start) / DAY_MS));
    const today = Date.now();
    const result = [];

    for (let d = 0; d <= totalDays; d++) {
      const dayEnd = start + d * DAY_MS;
      const dateStr = new Date(dayEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const ideal = Math.max(0, Math.round((totalCommitted - (totalCommitted * d) / totalDays) * 10) / 10);

      if (dayEnd > today + DAY_MS) {
        result.push({
          day: `Day ${d}`,
          date: dateStr,
          ideal,
          actual: null,
        });
      } else {
        const burnedSoFar = doneItems
          .filter((item) => item.at <= dayEnd + DAY_MS - 1)
          .reduce((sum, item) => sum + item.pts, 0);

        const actual = Math.max(0, totalCommitted - burnedSoFar);
        result.push({
          day: `Day ${d}`,
          date: dateStr,
          ideal,
          actual,
        });
      }
    }

    return result;
  }, [issues, selectedSprint]);

  // Velocity Report Data (Committed vs Completed story points across historical sprints)
  const velocityData = useMemo(() => {
    return sprints.map((s) => {
      const sIssues = issues.filter((i) => i.sprintId === s.id);
      const committed = sIssues.reduce((sum, i) => sum + (Number(i.storyPoints) || 0), 0);
      const completed = sIssues
        .filter((i) => i.status.toLowerCase() === 'done')
        .reduce((sum, i) => sum + (Number(i.storyPoints) || 0), 0);

      return {
        name: s.name,
        committed,
        completed,
        state: s.state,
      };
    });
  }, [sprints, issues]);

  const rollingVelocity = useMemo(() => {
    if (velocityData.length === 0) return 0;
    const completedList = velocityData.map((v) => v.completed);
    return Math.round(completedList.reduce((a, b) => a + b, 0) / completedList.length);
  }, [velocityData]);

  // Cumulative Flow Diagram (CFD) Data
  const cfdData = useMemo(() => {
    const days = 14;
    const now = Date.now();
    const result = [];

    for (let d = days - 1; d >= 0; d--) {
      const dayEndMs = now - d * DAY_MS;
      const dateStr = new Date(dayEndMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const existingIssues = issues.filter(
        (i) => new Date(i.createdAt).getTime() <= dayEndMs
      );

      let todo = 0;
      let inProgress = 0;
      let done = 0;

      for (const item of existingIssues) {
        const lower = item.status.toLowerCase();
        if (lower === 'done' || lower === 'closed') {
          if (new Date(item.updatedAt).getTime() <= dayEndMs) {
            done++;
          } else {
            inProgress++;
          }
        } else if (lower.includes('progress') || lower.includes('review') || lower.includes('dev')) {
          inProgress++;
        } else {
          todo++;
        }
      }

      result.push({
        date: dateStr,
        'To Do': todo,
        'In Progress': inProgress,
        'Done': done,
      });
    }

    return result;
  }, [issues]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#111723] border border-[#263348]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Agile Analytics & Velocity Reports</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise burndown burn-rate, historical velocity variance, and cumulative flow trends.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090d16] border border-[#263348]">
          <button
            onClick={() => setActiveReportTab('burndown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReportTab === 'burndown'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Burndown</span>
          </button>

          <button
            onClick={() => setActiveReportTab('velocity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReportTab === 'velocity'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Velocity</span>
          </button>

          <button
            onClick={() => setActiveReportTab('cfd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReportTab === 'cfd'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cumulative Flow</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111723] border border-[#263348]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Points</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-white">{metrics.totalPoints}</span>
            <span className="text-xs text-slate-400 font-mono">100% committed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111723] border border-[#263348]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Points Burned</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.completedPoints}</span>
            <span className="text-xs text-emerald-400 font-semibold">{metrics.completionRate}% rate</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111723] border border-[#263348]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Velocity Average</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-blue-400">{rollingVelocity} pts</span>
            <span className="text-xs text-blue-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> rolling 7
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111723] border border-[#263348]">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Work items</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{metrics.inProgress}</span>
            <span className="text-xs text-rose-400">{metrics.openBugs} open bugs</span>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-5 rounded-2xl bg-[#111723] border border-[#263348]">
        {/* TAB 1: Burndown Chart */}
        {activeReportTab === 'burndown' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Sprint Burndown Chart
                </h3>
                <p className="text-xs text-slate-400">
                  Ideal Burn Rate (dashed) vs. Actual Burn (solid blue) across active sprint days.
                </p>
              </div>

              {/* Sprint selector */}
              {sprints.length > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    className="bg-[#090d16] border border-[#263348] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {burndownData.length === 0 ? (
              <div className="h-72 flex items-center justify-center border border-dashed border-[#263348] rounded-xl text-slate-500 text-xs">
                No active sprint with start and end dates available to plot a burndown.
              </div>
            ) : (
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b0f17',
                        borderColor: '#263348',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      name="Ideal Burn (pts)"
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Remaining (pts)"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Velocity Bar Chart */}
        {activeReportTab === 'velocity' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Sprint Velocity Chart
              </h3>
              <p className="text-xs text-slate-400">
                Story Points Committed vs. Completed per sprint, with rolling velocity reference line.
              </p>
            </div>

            {velocityData.length === 0 ? (
              <div className="h-72 flex items-center justify-center border border-dashed border-[#263348] rounded-xl text-slate-500 text-xs">
                No sprint history available to calculate velocity.
              </div>
            ) : (
              <div className="h-80 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b0f17',
                        borderColor: '#263348',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <ReferenceLine
                      y={rollingVelocity}
                      stroke="#eab308"
                      strokeDasharray="4 4"
                      label={{ value: `Avg (${rollingVelocity} pts)`, fill: '#eab308', fontSize: 11 }}
                    />
                    <Bar dataKey="committed" name="Committed Points" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed Points" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Cumulative Flow Diagram (CFD) */}
        {activeReportTab === 'cfd' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cumulative Flow Diagram (CFD)
              </h3>
              <p className="text-xs text-slate-400">
                Work-in-progress distribution across workflow categories over the past 14 days.
              </p>
            </div>

            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cfdData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0b0f17',
                      borderColor: '#263348',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="Done"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Area
                    type="monotone"
                    dataKey="In Progress"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="To Do"
                    stackId="1"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
