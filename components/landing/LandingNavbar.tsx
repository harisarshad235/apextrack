'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Compass } from 'lucide-react';
import { KynovLogo } from '@/components/brand/KynovLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { User } from '@/db/schema';

interface LandingNavbarProps {
  currentUser?: User | null;
}

export function LandingNavbar({ currentUser }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#090D16]/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition">
          <KynovLogo size={28} variant="full" />
        </Link>

        {/* Desktop Navigation Links (Directly matching SaaSable Screenshot 1) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 font-bold transition"
          >
            Home
          </Link>
          <a
            href="#features"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Features
          </a>
          <a
            href="#sprints"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Agile Sprints
          </a>
          <a
            href="#docs"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Docs ↗
          </a>
        </nav>

        {/* Actions & Theme Toggle */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          {currentUser ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0052cc] hover:bg-[#0043a8] text-white text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0052cc] hover:bg-[#0043a8] text-white text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95"
              >
                <span>Get Started</span>
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

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="#sprints"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Agile Sprints
            </a>
            <a
              href="#docs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Docs ↗
            </a>
          </nav>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="w-full text-center px-4 py-2.5 rounded-full bg-[#0052cc] text-white text-xs font-semibold shadow-xs"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full text-center px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="w-full text-center px-4 py-2.5 rounded-full bg-[#0052cc] text-white text-xs font-semibold shadow-xs"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
