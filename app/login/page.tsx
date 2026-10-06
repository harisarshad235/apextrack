'use client';

import React, { useState, useTransition, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, UserPlus, Sparkles, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser } from '@/app/actions/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

function LoginWrapper() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'signin';
  
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('tab') === 'register') {
      setTab('register');
    }
  }, [searchParams]);

  const handleQuickSignIn = (targetEmail: string) => {
    setError(null);
    startTransition(async () => {
      const res = await loginUser(targetEmail, 'ApexTrack2026!');
      if (res.success) {
        router.push(res.redirect || '/');
      } else {
        setError(res.error || 'Persona sign-in failed');
      }
    });
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl z-10 transition-colors">
        {/* Brand Header with Vector Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <ApexTrackLogo size={48} />
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ApexTrack</h1>
            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Enterprise Agile & Knowledge Base Portal
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setError(null);
            }}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
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
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              tab === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modular Form Components */}
        {tab === 'signin' ? <LoginForm /> : <RegisterForm />}

        {/* Demo Fast Switch Personas (Shown only in non-production) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2.5 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Fast Demo Personas (Dev Only)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickSignIn('alex.chen@apextrack.io')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition disabled:opacity-50"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Alex Chen</div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">Admin</div>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickSignIn('s.jenkins@apextrack.io')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition disabled:opacity-50"
              >
                <div className="font-semibold text-slate-900 dark:text-white truncate">Sarah J.</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">Member</div>
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleQuickSignIn('devin.v@clientpartner.org')}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-left transition disabled:opacity-50"
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
      <LoginWrapper />
    </Suspense>
  );
}
