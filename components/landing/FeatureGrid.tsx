'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Globe2,
  Kanban,
  Zap,
  BookOpen,
  RefreshCw,
  Compass,
  ArrowRight,
} from 'lucide-react';

export function FeatureGrid() {
  const features = [
    {
      icon: ShieldCheck,
      title: 'WCAG & Security Compliant',
      description: 'Ensure enterprise security with strict RBAC, audit logs, and accessible UI for high-velocity browsing.',
    },
    {
      icon: Globe2,
      title: 'SEO & Edge Optimized',
      description: 'Boost performance and visibility with sub-25ms Cloudflare Workers edge execution and cached manifests.',
    },
    {
      icon: Kanban,
      title: 'Agile Sprints & Kanban',
      description: 'Customize swimlanes, execute multi-sprint cycles, and calculate automated burndown trajectories.',
    },
    {
      icon: Zap,
      title: 'High Performance UI',
      description: 'Adjust content layout for visual coherence with React 19 optimistic updates and instant transitions.',
    },
    {
      icon: BookOpen,
      title: 'Detailed Documentation',
      description: 'Access comprehensive documentation, tech specs, and user manuals with Markdown rendering.',
    },
    {
      icon: RefreshCw,
      title: 'Regular Updates & CI/CD',
      description: 'Receive continuous updates with automated Cloudflare Workers edge deployment and webhook syncing.',
    },
  ];

  const stats = [
    { value: '10x+', label: 'Velocity Boost' },
    { value: '50+', label: 'Project Workflows' },
    { value: '99.99%', label: 'Edge Availability' },
    { value: '1200+', label: 'Hours Saved' },
  ];

  return (
    <section id="features" className="py-16 md:py-24 space-y-24">
      {/* 1. Comprehensive UI Kit Tailored to your Need (Matching SaaSable Screenshot 1) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Comprehensive Toolkit Tailored to your Need
          </h2>
        </div>

        {/* Outer Soft Rounded Container Card with 6 Feature Items */}
        <div className="rounded-3xl p-6 sm:p-10 bg-slate-50/70 dark:bg-[#111622]/60 border border-slate-200/70 dark:border-slate-800/80 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="space-y-3.5">
                  {/* Sky blue circular icon badge */}
                  <div className="w-10 h-10 rounded-full bg-sky-100/80 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sub CTA Bar below the grid */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Ready to transform your sprint velocity with one powerful platform?
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/signup"
                className="px-5 py-2 rounded-full bg-[#0052cc] hover:bg-[#0043a8] text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              >
                Start Free Sprint
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Endless Possibilities & Stats (Matching SaaSable Screenshot 1 Bottom Row) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Endless Possibilities
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Everything you need to design both the marketing site and the admin interface for your SaaS product.
          </p>
        </div>

        {/* 4 Soft Pill Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl bg-slate-50/80 dark:bg-[#111622]/60 border border-slate-200/70 dark:border-slate-800/80 shadow-2xs space-y-1"
            >
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {st.value}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;
