'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles, Layers, BookOpen, Kanban } from 'lucide-react';
import { ApexLogo } from '@/components/brand/ApexLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User } from '@/db/schema';

interface LandingNavbarProps {
  currentUser?: User | null;
}

export function LandingNavbar({ currentUser }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition">
          <ApexLogo size={30} showWordmark={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <a
            href="#features"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>Features</span>
          </a>
          <a
            href="#sprints"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <Kanban className="w-3.5 h-3.5 text-indigo-500" />
            <span>Agile Sprints</span>
          </a>
          <a
            href="#docs"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Knowledge Base</span>
          </a>
          <a
            href="#security"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Security &amp; RBAC</span>
          </a>
        </nav>

        {/* Actions & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          {currentUser ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#090d16] px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-150">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            Features
          </a>
          <a
            href="#sprints"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            Agile Sprints
          </a>
          <a
            href="#docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            Knowledge Base
          </a>
          <a
            href="#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600"
          >
            Security &amp; RBAC
          </a>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
