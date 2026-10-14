'use client';

import React, { useState } from 'react';
import {
  Kanban,
  TrendingDown,
  Shield,
  CheckCircle2,
  FileText,
  MoreHorizontal,
  BellOff,
  Sparkles,
  Layers,
} from 'lucide-react';
import { KynovLogo } from '@/components/brand/KynovLogo';

export function InteractivePreview() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'board' | 'burndown' | 'rbac'>('showcase');
  const [selectedCard, setSelectedCard] = useState<string>('KYN-101');

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B0D12] shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
      {/* Chrome Window Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#080a0f]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
          <span className="ml-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            app.kynov.io/workspace/KYN-SPRINT-24
          </span>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'showcase'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kynov Brand &amp; UI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'board'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
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
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Burndown</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'rbac'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security RBAC</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Ultra-Premium Brand Showcase (Direct Recreation of image_3.png) */}
      {activeTab === 'showcase' && (
        <div className="relative p-6 sm:p-10 bg-radial from-[#121727] via-[#0B0D12] to-[#07090e] overflow-hidden min-h-[460px] flex flex-col justify-between select-none">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/15 to-violet-600/10 blur-3xl pointer-events-none rounded-full" />

          {/* Top Floating Glass Cards Layer */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Left preview card: Mini Kanban Snippet */}
            <div className="hidden md:block p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-xl text-left transform -rotate-1 hover:rotate-0 transition duration-300">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Kanban className="w-3 h-3 text-indigo-400" /> Active View
                </span>
                <span className="text-[10px] text-slate-500 font-mono">KYN-SPRINT</span>
              </div>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">KYN-101</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-indigo-400 font-bold">KYN-104</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div />

            {/* Right floating cards: Knowledge Base & Doc View from image_3 */}
            <div className="space-y-3">
              {/* Card A: KYN-101 Knowledge Base card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md shadow-xl text-left transform translate-x-1 hover:translate-x-0 transition duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">KYN-101</span>
                  <MoreHorizontal className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Knowledge Base</span>
                </div>
                <div className="space-y-1 pt-1 opacity-40">
                  <div className="w-3/4 h-1.5 rounded-full bg-slate-600" />
                  <div className="w-1/2 h-1.5 rounded-full bg-slate-700" />
                </div>
              </div>

              {/* Card B: Doc view card */}
              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-xl text-left">
                <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs font-medium">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono ml-1">Doc view</span>
                </div>
                <div className="space-y-1.5 opacity-30">
                  <div className="w-5/6 h-1.5 rounded-full bg-slate-600" />
                  <div className="w-2/3 h-1.5 rounded-full bg-slate-700" />
                </div>
              </div>

              {/* Card C: KYN-101 Ticket barometer card with Mute */}
              <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded border border-slate-600" />
                  <span className="text-[11px] font-mono font-bold text-indigo-400">KYN-101</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700/60 font-medium">
                  Mute
                </span>
              </div>
            </div>
          </div>

          {/* Central Epic Lockup: The Kinetic Pulse Monogram, Typography, and Subtitle */}
          <div className="relative z-10 py-8 my-auto flex flex-col items-center justify-center text-center">
            <div className="transition-transform duration-300 hover:scale-105 cursor-pointer">
              <KynovLogo size={96} variant="icon" />
            </div>

            <div className="mt-4 flex flex-col items-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50">
                Kynov
              </h2>
              <p className="text-sm sm:text-base font-medium text-slate-400 tracking-normal mt-1.5">
                Agile Velocity &amp; Sprint Tracking
              </p>
            </div>
          </div>

          {/* Bottom Dock: Container Variants & Typography Badge */}
          <div className="relative z-10 pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-center sm:justify-between gap-4">
            {/* Left: Container variations */}
            <div className="flex items-center gap-3">
              {/* Squircle container with Kinetic Pulse K */}
              <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-[#232836] flex items-center justify-center shadow-lg hover:border-cyan-500/50 transition">
                <KynovLogo size={34} variant="icon" />
              </div>
              {/* Medium squircle */}
              <div className="w-10 h-10 rounded-xl bg-slate-900/70 border border-[#232836] flex items-center justify-center shadow-md">
                <KynovLogo size={24} variant="icon" />
              </div>
              {/* Small micro squircle */}
              <div className="w-8 h-8 rounded-lg bg-slate-900/60 border border-[#232836] flex items-center justify-center">
                <KynovLogo size={18} variant="icon" />
              </div>
            </div>

            {/* Right: Typography badge card */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-[#232836] flex items-center justify-center shadow-lg">
                <KynovLogo size={34} variant="icon" />
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-900/80 border border-[#232836] shadow-lg text-left">
                <span className="text-[10px] text-slate-400 font-medium block mb-1">Project Key</span>
                <span className="inline-block px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-extrabold text-sm tracking-wider shadow-sm">
                  KYN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Interactive Kanban Board */}
      {activeTab === 'board' && (
        <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-[#0B0D12]">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Active Sprint 24</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
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
            <div className="rounded-2xl p-3 bg-white dark:bg-[#0e121a] border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                <span>TO DO</span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                  2
                </span>
              </div>

              <div
                onClick={() => setSelectedCard('KYN-104')}
                className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border transition cursor-pointer ${
                  selectedCard === 'KYN-104'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    KYN-104
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
                    Medium
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                  Multi-Region Cloudflare D1 Read Replicas
                </h4>
                <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-semibold">
                    5 pts
                  </span>
                  <span>Assignee: Alex C.</span>
                </div>
              </div>
            </div>

            {/* Column: In Progress */}
            <div className="rounded-2xl p-3 bg-white dark:bg-[#0e121a] border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                <span className="text-indigo-600 dark:text-indigo-400">IN PROGRESS</span>
                <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                  1
                </span>
              </div>

              <div
                onClick={() => setSelectedCard('KYN-101')}
                className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border transition cursor-pointer ${
                  selectedCard === 'KYN-101'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    KYN-101
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
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-semibold">
                    8 pts
                  </span>
                  <span>Assignee: Sarah J.</span>
                </div>
              </div>
            </div>

            {/* Column: Done */}
            <div className="rounded-2xl p-3 bg-white dark:bg-[#0e121a] border border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                <span className="text-emerald-600 dark:text-emerald-400">DONE</span>
                <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  2
                </span>
              </div>

              <div
                onClick={() => setSelectedCard('KYN-098')}
                className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border transition cursor-pointer ${
                  selectedCard === 'KYN-098'
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 line-through">
                    KYN-098
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
        <div className="p-6 space-y-5 bg-slate-50/50 dark:bg-[#0B0D12]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Planned Points</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">48 SP</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Completed</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">42 SP</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Remaining</span>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">6 SP</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500">Completion Rate</span>
              <p className="text-xl font-bold text-violet-600 dark:text-violet-400 mt-1">87.5%</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Sprint 24 Burndown Guideline vs. Actual</span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Ideal Guideline
                </span>
                <span className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <span className="w-2.5 h-1.5 bg-indigo-500 rounded-xs inline-block" /> Actual Progress
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
                      className="w-3 bg-indigo-600 dark:bg-indigo-500 rounded-t-xs shadow-xs"
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
        <div className="p-6 space-y-4 bg-slate-50/50 dark:bg-[#0B0D12]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Admin &amp; Engineering Lead Persona
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                  GLOBAL BYPASS
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Super administrators inherit unrestricted access to all multi-project workspaces, security audit streams, and sprint transition rules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Project Members
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-500 font-bold">
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
