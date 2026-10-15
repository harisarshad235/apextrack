'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { InteractivePreview } from '@/components/landing/InteractivePreview';
import { User } from '@/db/schema';

interface LandingHeroProps {
  currentUser?: User | null;
}

export function LandingHero({ currentUser }: LandingHeroProps) {
  const techPills = [
    { label: 'React 19', dotColor: 'bg-cyan-400' },
    { label: 'Next.js 16', dotColor: 'bg-slate-900 dark:bg-white' },
    { label: 'Cloudflare Edge', dotColor: 'bg-amber-500' },
    { label: 'TypeScript', dotColor: 'bg-blue-500' },
    { label: 'D1 SQLite', dotColor: 'bg-indigo-500' },
    { label: 'R2 Storage', dotColor: 'bg-orange-500' },
    { label: 'Figma System', dotColor: 'bg-purple-500' },
  ];

  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Top Pill Badge (Directly matching SaaSable Screenshot 1) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
          <span>One Platform, Endless</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
            🔮 Possibilities
          </span>
        </div>

        {/* Clean, High-Impact Modern Typography */}
        <div className="max-w-4xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.14]">
            Modern Agile Engine and High-Velocity Workspace
          </h1>

          {/* SaaSable Signature Wavy Divider Accent */}
          <div className="py-1">
            <svg
              className="w-28 h-2.5 mx-auto text-blue-500 dark:text-blue-400 opacity-80"
              viewBox="0 0 100 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 2 5 Q 14 0, 26 5 T 50 5 T 74 5 T 98 5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Plan sprints, track enterprise hierarchies, and build high-velocity software with our unified agile platform, built following modern design guidelines.
          </p>
        </div>

        {/* Primary CTA (SaaSable Pill Button) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={currentUser ? '/dashboard' : '/signup'}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0052cc] hover:bg-[#0043a8] text-white font-medium text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Workspace</span>
          </Link>
          {!currentUser && (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Tech Stack Pills Row (SaaSable Screenshot 1 Tech Badges) */}
        <div className="pt-3 pb-2 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {techPills.map((pill, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium shadow-2xs"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pill.dotColor}`} />
              <span>{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Elevated Floating Hero Preview Viewport (SaaSable Screenshot 1 Mockup) */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="relative rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-[#0A1128] via-[#0E1630] to-[#080D1F] border border-slate-800/80 shadow-2xl overflow-hidden">
            <InteractivePreview />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingHero;
