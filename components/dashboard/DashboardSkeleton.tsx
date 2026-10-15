'use client';

import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-[#080d1a] text-slate-100 overflow-hidden select-none">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-slate-800/80 bg-[#0c1222]/90 flex flex-col justify-between p-4 hidden md:flex shrink-0">
        <div className="space-y-6">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-500/30 border border-blue-500/20 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-800 rounded-md animate-pulse" />
              <div className="h-2.5 w-14 bg-slate-800/60 rounded animate-pulse" />
            </div>
          </div>

          {/* Project Switcher Pill */}
          <div className="h-10 w-full rounded-xl bg-slate-800/50 border border-slate-800 animate-pulse px-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-20 bg-slate-700/80 rounded animate-pulse" />
            </div>
            <div className="w-3 h-3 rounded bg-slate-700/60 animate-pulse" />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { width: 'w-28', active: true },
              { width: 'w-24', active: false },
              { width: 'w-32', active: false },
              { width: 'w-20', active: false },
              { width: 'w-28', active: false },
              { width: 'w-24', active: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                  item.active
                    ? 'bg-blue-600/15 border-blue-500/30'
                    : 'border-transparent'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded ${
                    item.active ? 'bg-blue-400/50' : 'bg-slate-800'
                  } animate-pulse`}
                />
                <div
                  className={`h-3.5 ${item.width} ${
                    item.active ? 'bg-blue-300/40' : 'bg-slate-800'
                  } rounded animate-pulse`}
                />
              </div>
            ))}
          </nav>
        </div>

        {/* User Card Skeleton */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse shrink-0" />
          <div className="space-y-1 flex-1 min-w-0">
            <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
            <div className="h-2.5 w-14 bg-slate-800/60 rounded animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main Container Skeleton */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Skeleton */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0c1222]/60 px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="h-9 w-full max-w-xs md:max-w-sm rounded-xl bg-slate-800/50 border border-slate-800/80 animate-pulse flex items-center px-3 justify-between">
              <div className="h-3 w-28 bg-slate-700/60 rounded" />
              <div className="h-4 w-10 bg-slate-700/40 rounded text-[10px]" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-28 rounded-xl bg-blue-600/20 border border-blue-500/30 animate-pulse hidden sm:block" />
            <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-800 animate-pulse" />
            <div className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-800 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse ml-1" />
          </div>
        </header>

        {/* Content Body Skeleton */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Welcome Banner Skeleton */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/40 border border-blue-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-800 rounded-lg animate-pulse" />
              <div className="h-3.5 w-80 max-w-full bg-slate-800/60 rounded animate-pulse" />
            </div>
            <div className="h-10 w-36 rounded-xl bg-blue-600/30 border border-blue-500/30 animate-pulse shrink-0" />
          </div>

          {/* 4 Metric Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#0e1628]/80 border border-slate-800/80 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 bg-slate-800 rounded animate-pulse" />
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-slate-700/70 rounded-lg animate-pulse" />
                <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-blue-500/20 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Main Visuals Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area Skeleton (2 Cols) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e1628]/80 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-slate-800 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-slate-800/60 rounded animate-pulse" />
                </div>
                <div className="h-7 w-20 rounded-lg bg-slate-800/60 animate-pulse" />
              </div>
              <div className="h-64 rounded-xl bg-slate-900/50 border border-slate-800/40 flex items-end justify-between p-6 gap-3">
                {[40, 65, 30, 85, 55, 95, 70, 45].map((heightPercent, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-900/30 to-blue-500/20 rounded-t-md animate-pulse"
                    style={{ height: `${heightPercent}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activity Stream Skeleton (1 Col) */}
            <div className="p-6 rounded-2xl bg-[#0e1628]/80 border border-slate-800/80 space-y-4">
              <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="space-y-3 pt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/40">
                    <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="h-3 w-full bg-slate-800/80 rounded animate-pulse" />
                      <div className="h-2.5 w-1/2 bg-slate-800/50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
