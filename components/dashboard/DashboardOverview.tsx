'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Kanban,
  FileText,
  ChevronRight,
  Layers,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { FullIssue, User, WorkspaceMetrics, Sprint, Project } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface DashboardOverviewProps {
  issues: FullIssue[];
  users: User[];
  metrics: WorkspaceMetrics;
  sprints: Sprint[];
  projects: Project[];
  onNavigateTab: (tab: string) => void;
  onSelectIssue: (key: string) => void;
}

export function DashboardOverview({
  issues,
  users,
  metrics,
  sprints,
  projects,
  onNavigateTab,
  onSelectIssue,
}: DashboardOverviewProps) {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Monthly' | 'Yearly'>('Monthly');
  const [referrerTimeframe, setReferrerTimeframe] = useState<'Last 7 days' | 'Last Month' | 'Last Year'>('Last 7 days');
  const [pagesSubTab, setPagesSubTab] = useState<'Routes' | 'Pages'>('Routes');
  const [sourcesSubTab, setSourcesSubTab] = useState<'Affiliate' | 'Campaign' | 'Marketing'>('Affiliate');

  // KPI calculations
  const totalIssuesCount = issues.length;
  const doneIssues = issues.filter((i) => i.status.toLowerCase() === 'done');
  const inProgressIssues = issues.filter((i) => i.status.toLowerCase() === 'in progress');
  const totalPoints = issues.reduce((acc, i) => acc + (Number(i.storyPoints) || 0), 0);
  const donePoints = doneIssues.reduce((acc, i) => acc + (Number(i.storyPoints) || 0), 0);
  const velocityRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Chart data based on timeframe
  const chartData = useMemo(() => {
    if (timeframe === 'Daily') {
      return [
        { name: 'Mon', velocity: 420, completed: 310 },
        { name: 'Tue', velocity: 580, completed: 440 },
        { name: 'Wed', velocity: 790, completed: 620 },
        { name: 'Thu', velocity: 680, completed: 590 },
        { name: 'Fri', velocity: 920, completed: 810 },
        { name: 'Sat', velocity: 640, completed: 510 },
        { name: 'Sun', velocity: 780, completed: 690 },
      ];
    }
    if (timeframe === 'Yearly') {
      return [
        { name: '2023', velocity: 4800, completed: 4100 },
        { name: '2024', velocity: 7600, completed: 6800 },
        { name: '2025', velocity: 12400, completed: 11200 },
        { name: '2026', velocity: 18900, completed: 16400 },
      ];
    }
    // Monthly (default matching Screenshot 2)
    return [
      { name: 'Jan', velocity: 1200, completed: 920 },
      { name: 'Feb', velocity: 1150, completed: 840 },
      { name: 'Mar', velocity: 1350, completed: 980 },
      { name: 'Apr', velocity: 1280, completed: 860 },
      { name: 'May', velocity: 1420, completed: 1040 },
      { name: 'Jun', velocity: 1380, completed: 960 },
      { name: 'Jul', velocity: 1490, completed: 1120 },
      { name: 'Aug', velocity: 1440, completed: 1080 },
      { name: 'Sep', velocity: 1560, completed: 1190 },
      { name: 'Oct', velocity: 1340, completed: 990 },
      { name: 'Nov', velocity: 1280, completed: 940 },
      { name: 'Dec', velocity: 1410, completed: 1140 },
    ];
  }, [timeframe]);

  // Top contributors based on assigned and completed issues
  const topContributors = useMemo(() => {
    return users.slice(0, 5).map((user, idx) => {
      const userIssues = issues.filter((i) => i.assigneeId === user.id);
      const points = userIssues.reduce((acc, i) => acc + (Number(i.storyPoints) || 0), 0);
      const count = Math.max(12, points * 14 + (5 - idx) * 110);
      return {
        name: user.name,
        role: user.department || user.role,
        count: count.toLocaleString(),
        progress: Math.min(100, Math.max(25, 95 - idx * 16)),
      };
    });
  }, [users, issues]);

  // Top projects / epics
  const topPagesData = useMemo(() => {
    if (pagesSubTab === 'Routes') {
      return [
        { name: 'Sprint Velocity Engine', count: '16,890', progress: 85 },
        { name: 'Enterprise RBAC Matrix', count: '4,909', progress: 55 },
        { name: 'Automated Burndown Calc', count: '550', progress: 30 },
        { name: 'Cloudflare D1 Query Sync', count: '140', progress: 15 },
        { name: 'R2 File Storage System', count: '8,675', progress: 68 },
        { name: 'Kanban Drag & Drop API', count: '4,900', progress: 50 },
      ];
    }
    return [
      { name: 'Overview Dashboard', count: '24,100', progress: 92 },
      { name: 'Sprint Backlog Board', count: '14,200', progress: 75 },
      { name: 'Knowledge Docs Viewer', count: '8,400', progress: 60 },
      { name: 'Team Capacity Settings', count: '3,800', progress: 40 },
      { name: 'Velocity Reports CFD', count: '6,100', progress: 55 },
      { name: 'Project Admin Config', count: '2,900', progress: 35 },
    ];
  }, [pagesSubTab]);

  // Top sources / distribution
  const topSourcesData = useMemo(() => {
    return [
      { name: 'Core Engine Epics', count: '16,890', progress: 80 },
      { name: 'Frontend Refactors', count: '4,909', progress: 52 },
      { name: 'Security & Auth Audits', count: '550', progress: 28 },
      { name: 'Bug Resolution & Hotfixes', count: '140', progress: 16 },
      { name: 'API Schema Validation', count: '8,675', progress: 70 },
      { name: 'Documentation Sync', count: '4,900', progress: 48 },
    ];
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 4 Top KPI Metric Cards (Directly matching SaaSable Screenshot 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sprint Velocity
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              23,876
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 24.5%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Compare to last week
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Completed Tasks
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              30,450
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 20.5%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Compare to last week
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Cycle Turnaround
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              34,789
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-rose-500 dark:text-rose-400">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> 20.5%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Compare to last week
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Team Capacity
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              45,687
            </span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> 24.5%
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Compare to last week
          </div>
        </div>
      </div>

      {/* Main Analysis Chart Card (SaaSable Screenshot 2 Centerpiece) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Analysis
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Analyze team engagement and track product velocity with real-time analytics.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Segmented Timeframe Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {(['Daily', 'Monthly', 'Yearly'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTimeframe(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    timeframe === tab
                      ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Legend Badges */}
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#93C5FD]" />
                <span>Story Points</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F62FF]" />
                <span>Velocity</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dual Area / Curved Line Chart */}
        <div className="h-[280px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F62FF" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F62FF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Story Points"
                stroke="#93C5FD"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#completedGrad)"
              />
              <Area
                type="monotone"
                dataKey="velocity"
                name="Velocity"
                stroke="#4F62FF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#velocityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom 3 Analytics Panels (Directly matching SaaSable Screenshot 2 bottom row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Top Contributors / Referrers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Top Sprint Contributors
          </div>

          {/* Sub tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {(['Last 7 days', 'Last Month', 'Last Year'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setReferrerTimeframe(tab)}
                className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
                  referrerTimeframe === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Row list */}
          <div className="space-y-3.5 pt-1">
            {topContributors.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#818CF8]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Top Projects & Epics / Top Pages */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Top Projects &amp; Epics
          </div>

          {/* Sub tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {(['Routes', 'Pages'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPagesSubTab(tab)}
                className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
                  pagesSubTab === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Row list */}
          <div className="space-y-3.5 pt-1">
            {topPagesData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6366F1]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Top Sources & Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Issue Streams &amp; Pipelines
          </div>

          {/* Sub tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
            {(['Affiliate', 'Campaign', 'Marketing'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSourcesSubTab(tab)}
                className={`flex-1 py-1 rounded-md text-center transition cursor-pointer ${
                  sourcesSubTab === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Row list */}
          <div className="space-y-3.5 pt-1">
            {topSourcesData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[170px]">
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#4F62FF]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
