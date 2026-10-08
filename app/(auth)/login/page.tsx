'use client';

import React, { useState, useTransition, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LogIn, UserPlus, Sparkles, AlertCircle, Loader2, Info } from 'lucide-react';
import { loginAction } from '@/app/actions/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

function LoginContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'signin';
  const oauthError = searchParams.get('error');
  const oauthProvider = searchParams.get('provider') || 'OAuth';

  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setTab('register');
    }
  }, [searchParams]);

  const handleQuickSignIn = (targetEmail: string) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await loginAction({ email: targetEmail, password: 'ApexTrack2026!' });
        if (!res.success) {
          if (res.error === 'PENDING_APPROVAL') {
            window.location.href = '/awaiting-approval';
            return;
          }
          setError(res.error || 'Persona sign-in failed');
          return;
        }
        window.location.href = '/dashboard';
      } catch {
        setError('Network error occurred during persona sign-in.');
      }
    });
  };

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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ApexTrack</h1>
            <span className="text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Enterprise Agile &amp; Knowledge Base Platform
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
              To enable 1-click {oauthProvider} login, set <code className="font-mono font-bold">{oauthProvider.toUpperCase()}_CLIENT_ID</code> and <code className="font-mono font-bold">{oauthProvider.toUpperCase()}_CLIENT_SECRET</code> in your environment. You can sign in using email credentials below in the meantime.
            </p>
          </div>
        )}

        {/* General Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              tab === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </button>
        </div>

        {/* Social OAuth Buttons (Google & GitHub) */}
        <SocialAuthButtons />

        {/* Modular Form Components */}
        {tab === 'signin' ? <LoginForm /> : <RegisterForm />}

        {/* Demo Fast Switch Personas (Shown in non-production) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-7 pt-5 border-t border-slate-200/80 dark:border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2.5 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Fast Demo Personas (Dev Only)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickSignIn('alex.chen@apextrack.io')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition disabled:opacity-50 cursor-pointer"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Alex Chen</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">Admin</div>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickSignIn('s.jenkins@apextrack.io')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition disabled:opacity-50 cursor-pointer"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Sarah J.</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">Member</div>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickSignIn('devin.v@clientpartner.org')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition disabled:opacity-50 cursor-pointer"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Devin V.</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">Viewer</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
