'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { KeyRound, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Invalid Reset Link</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            This password reset link is missing a security token or has expired. Please request a new link.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/forgot-password"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-md"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Password Updated!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your ApexTrack password has been securely updated. You can now sign in with your new credentials.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-md"
          >
            Sign In to Workspace
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await resetPassword({ token, newPassword });
        if (!res?.success) {
          setError(res?.error || 'Failed to reset password. The link may have expired.');
        } else {
          setSuccess(true);
        }
      } catch (err: unknown) {
        console.error('Password reset error:', err);
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(msg);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
        Choose a strong, secure new password for your workspace account.
      </p>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="new-password" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          New Password
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 pr-10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            tabIndex={-1}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Confirm New Password
        </label>
        <input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
            <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
          </>
        ) : (
          <>
            <KeyRound className="w-4 h-4" /> Save New Password
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
  );
}

export default function ResetPasswordPage() {
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
            Set New Password
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
