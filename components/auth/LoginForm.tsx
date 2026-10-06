'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginUser } from '@/app/actions/auth';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your work email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    startTransition(async () => {
      const res = await loginUser(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
        router.push(res.redirect || '/');
      } else {
        setError(res.error || 'Sign in failed');
      }
    });
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Work Email Address
        </label>
        <input
          type="email"
          required
          placeholder="alex.chen@apextrack.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            Password
          </label>
          <span className="text-[10px] text-slate-400">Default seed password: ApexTrack2026!</span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Enter security password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 pr-10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" /> Sign In to Workspace
          </>
        )}
      </button>
    </form>
  );
}
