'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cloud, Lock, Sparkles, Heart } from 'lucide-react';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070b12] text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <ApexTrackLogo size={28} />
              <span className="font-bold text-base text-slate-900 dark:text-white">ApexTrack</span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              The high-performance Agile Project Management &amp; Knowledge Base platform built for modern engineering teams. Powered by Cloudflare D1 Edge SQLite.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-blue-500" /> Cloudflare Edge
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" /> WebCrypto PBKDF2
              </span>
            </div>
          </div>

          {/* Column: Product */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#sprints" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Agile Sprints
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Kanban Board
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Knowledge Base
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Burndown Reports
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Security */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Security
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Project Isolation
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Role-Based Access
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  OAuth SSO (Google/GitHub)
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-500">Audit Trails</span>
              </li>
            </ul>
          </div>

          {/* Column: Account */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Access
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Open Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Badges & Copyright */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <p>© 2026 ApexTrack Inc. All rights reserved.</p>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> Enterprise RBAC Enforced
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Zero-Downtime SQLite D1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
