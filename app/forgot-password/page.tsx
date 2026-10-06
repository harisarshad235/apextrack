'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { requestPasswordReset } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await requestPasswordReset(email);
        setSubmitted(true);
      } catch (err: unknown) {
        console.error('Password reset request error:', err);
        // Even on error, show the confirmation screen to prevent enumeration
        setSubmitted(true);
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
        {/* Brand Header */}
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
            Password Recovery
          </p>
        </div>

        {submitted ? (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Check your email</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-slate-900 dark:text-white font-medium">{email}</strong>, we have dispatched a secure password reset link.
              </p>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2 text-left">
              <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>For security, the reset link will expire in <strong>15 minutes</strong>.</span>
            </div>

            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Enter the work email address linked to your ApexTrack workspace account. We will send you a one-time link to set a new password.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="reset-email" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" /> Send Reset Link
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
