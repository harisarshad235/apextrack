'use client';

import React from 'react';
import {
  Kanban,
  ShieldCheck,
  BookOpen,
  Bell,
  ArrowRight,
  TrendingUp,
  Lock,
  FileText,
  Mail,
  Check,
} from 'lucide-react';
import Link from 'next/link';

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 md:py-32 border-t border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Enterprise Product Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for Precision, Speed, and Scale
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Eliminate multi-tool sprawl. ApexTrack brings sprint lifecycles, project governance, and documentation together in a single, high-performance edge platform.
          </p>
        </div>

        {/* 4 Cards Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Jira-Style Agile Sprints */}
          <div
            id="sprints"
            className="group relative rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-[#0c121e]/60 backdrop-blur-xl shadow-xl hover:border-blue-500/50 transition duration-300 space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Kanban className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  Agile Core
                </span>
                <span className="text-xs font-semibold text-slate-400">Jira Parity</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Jira-Style Agile Sprints
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Plan, start, and complete multi-sprint lifecycles with transaction-safe state transitions. Track story points, original and remaining hour estimates, and real-time burndown velocity.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Sprint Lifecycle Capabilities
                </span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Multi-sprint backlog prioritization &amp; ranking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Automated burndown velocity curve calculations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Unfinished issue rollover into upcoming sprints
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Enterprise RBAC & Project Isolation */}
          <div
            id="security"
            className="group relative rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-[#0c121e]/60 backdrop-blur-xl shadow-xl hover:border-amber-500/50 transition duration-300 space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Governance
                </span>
                <span className="text-xs font-semibold text-slate-400">Strict Isolation</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Enterprise RBAC &amp; Project Isolation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Granular access control enforcing multi-tenant isolation. Super Admins and CTOs receive global bypass privileges, while regular members only view projects explicitly assigned in <code className="font-mono text-xs">project_members</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-500" /> Security Guarantees
                </span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Zero cross-project issue or document leakage
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Admin/CTO global bypass for audits &amp; governance
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Cloudflare Workers Edge security perimeter
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Confluence-Style Knowledge Base */}
          <div
            id="docs"
            className="group relative rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-[#0c121e]/60 backdrop-blur-xl shadow-xl hover:border-emerald-500/50 transition duration-300 space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Docs &amp; Specs
                </span>
                <span className="text-xs font-semibold text-slate-400">Confluence Parity</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Confluence-Style Knowledge Base
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Centralized architectural decisions, runbooks, and product specifications. Rich markdown formatting, instant multi-document full-text search, and Cloudflare R2 file attachments.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" /> Documentation Hub
                </span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> GitHub-Flavored Markdown with tables and alerts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Cloudflare R2 binary attachment streaming
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Categorized by Architecture, API, and Operations
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Automated @Mention Alerts & Bell Notifications */}
          <div className="group relative rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-[#0c121e]/60 backdrop-blur-xl shadow-xl hover:border-indigo-500/50 transition duration-300 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Real-Time Alerts
                </span>
                <span className="text-xs font-semibold text-slate-400">Non-Blocking</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Automated @Mention Alerts &amp; Bell Notifications
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Keep the team aligned without missing critical reviews. Real-time bell popover with unread counters, interactive @mention autocomplete, and resilient asynchronous email delivery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-500" /> Notification Pipeline
                </span>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Interactive in-app notification dropdown with deep linking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Asynchronous email delivery with self-mention filtering
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Deduplicated alerts and project member access verification
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl font-bold">Ready to modernize your engineering sprint cycle?</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Start free today with Google or GitHub OAuth. No credit card required.
            </p>
          </div>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-lg whitespace-nowrap transition active:scale-95 flex items-center gap-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
