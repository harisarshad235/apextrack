'use client';

import React, { useState } from 'react';
import {
  Kanban,
  TrendingDown,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<'board' | 'burndown' | 'rbac'>('board');
  const [selectedCard, setSelectedCard] = useState<string>('APEX-101');

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-[#0c121e]/90 shadow-2xl overflow-hidden backdrop-blur-xl transition-colors">
      {/* Chrome Window Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-[#090d16]/80">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            app.apextrack.io/workspace/APEX-SPRINT-24
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('burndown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'burndown'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Burndown Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'rbac'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Enterprise RBAC</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Kanban Board */}
      {activeTab === 'board' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Sprint 24</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  4 DAYS REMAINING
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target: Complete Enterprise OAuth &amp; In-App Notifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Total Velocity: 48 SP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column: To Do */}
            <div className="rounded-2xl p-3 bg-slate-50 dark:bg-[#080d16] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                <span>TO DO</span>
                <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  2
                </span>
              </div>

              <div
                onClick={() => setSelectedCard('APEX-104')}
                className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition cursor-pointer ${
                  selectedCard === 'APEX-104'
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    APEX-104
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
                    Medium
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  Multi-Region Cloudflare D1 Read Replicas
                </h4>
                <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                    5 pts
                  </span>
                  <span>Assignee: Alex C.</span>
                </div>
              </div>
            </div>

            {/* Column: In Progress */}
            <div className="rounded-2xl p-3 bg-slate-50 dark:bg-[#080d16] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                <span className="text-blue-600 dark:text-blue-400">IN PROGRESS</span>
                <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                  1
                </span>
              </div>

              <div
                onClick={() => setSelectedCard('APEX-101')}
                className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition cursor-pointer ${
                  selectedCard === 'APEX-101'
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    APEX-101
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/15 text-red-600 dark:text-red-400 font-semibold">
                    High
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  Google &amp; GitHub OAuth Social Handshake
                </h4>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                    #Auth-Epic
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                    8 pts
                  </span>
                  <span>Assignee: Sarah J.</span>
                </div>
              </div>
            </div>

            {/* Column: Done */}
            <div className="rounded-2xl p-3 bg-slate-50 dark:bg-[#080d16] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                <span className="text-emerald-600 dark:text-emerald-400">DONE</span>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                  2
                </span>
              </div>

              <div
                onClick={() => setSelectedCard('APEX-098')}
                className={`p-3 rounded-xl bg-white dark:bg-slate-900 border transition cursor-pointer ${
                  selectedCard === 'APEX-098'
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 line-through">
                    APEX-098
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-snug line-through opacity-80">
                  Slide-Over Detail Drawer &amp; Audit Logs
                </h4>
                <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-mono">
                  <span>Completed</span>
                  <span>13 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Burndown Analytics */}
      {activeTab === 'burndown' && (
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Planned Points</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">48 SP</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Completed</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">42 SP</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Remaining</span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">6 SP</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Completion Rate</span>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">87.5%</p>
            </div>
          </div>

          {/* High-Fidelity Burndown Trend Curve */}
          <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Sprint 24 Burndown Guideline vs. Actual</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Ideal Guideline
                </span>
                <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <span className="w-2.5 h-1.5 bg-blue-500 rounded-xs inline-block" /> Actual Progress
                </span>
              </div>
            </div>

            <div className="h-44 w-full flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-200 dark:border-slate-800">
              {[
                { day: 'Day 1', ideal: 100, actual: 100 },
                { day: 'Day 3', ideal: 80, actual: 85 },
                { day: 'Day 5', ideal: 60, actual: 55 },
                { day: 'Day 7', ideal: 40, actual: 32 },
                { day: 'Day 9', ideal: 20, actual: 12 },
                { day: 'Day 10', ideal: 0, actual: 6 },
              ].map((pt, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-32">
                    <div
                      className="w-3 bg-slate-300 dark:bg-slate-700 rounded-t-xs"
                      style={{ height: `${pt.ideal}%` }}
                      title={`Ideal: ${pt.ideal}%`}
                    />
                    <div
                      className="w-3 bg-blue-600 dark:bg-blue-500 rounded-t-xs shadow-xs"
                      style={{ height: `${pt.actual}%` }}
                      title={`Actual: ${pt.actual}%`}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{pt.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Enterprise RBAC Isolation */}
      {activeTab === 'rbac' && (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Admin &amp; CTO Persona
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                  GLOBAL BYPASS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Super administrators and CTOs inherit unrestricted access to all multi-project workflows, security audit streams, and sprint transition rules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Project Members
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 font-bold">
                  ISOLATED ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Regular team members are strictly confined to their explicitly assigned <code className="font-mono font-semibold">project_members</code> boundaries. Zero cross-project leakage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
