'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LogIn, UserPlus, Info, Loader2 } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

function SignupContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  const oauthProvider = searchParams.get('provider') || 'OAuth';

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Home Link & Theme Toggle */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          ← Back to Overview
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl z-10 transition-colors">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="mb-3 hover:scale-105 transition-transform">
            <ApexTrackLogo size={46} />
          </Link>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Join ApexTrack</h1>
            <span className="text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
              FREE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Enterprise Agile &amp; Knowledge Workspace
          </p>
        </div>

        {/* OAuth Warning Banner (Helpful Config Notice) */}
        {oauthError === 'oauth_config_missing' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>{oauthProvider} OAuth Not Configured Yet</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-300/80 leading-relaxed pl-6">
              To enable 1-click {oauthProvider} sign up, set <code className="font-mono font-bold">{oauthProvider.toUpperCase()}_CLIENT_ID</code> and <code className="font-mono font-bold">{oauthProvider.toUpperCase()}_CLIENT_SECRET</code> in your environment. You can sign up using email below.
            </p>
          </div>
        )}

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl mb-5 text-xs font-semibold">
          <Link
            href="/login"
            className="py-2 rounded-lg flex items-center justify-center gap-1.5 transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
          <div className="py-2 rounded-lg flex items-center justify-center gap-1.5 bg-blue-600 text-white shadow-sm">
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </div>
        </div>

        {/* Social OAuth Buttons */}
        <SocialAuthButtons />

        {/* Standard Register Form */}
        <RegisterForm />

        {/* Sign In Footer Link */}
        <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an ApexTrack account?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
