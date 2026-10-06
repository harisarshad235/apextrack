'use client';

import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

if (typeof window !== 'undefined' && typeof window.__name === 'undefined') {
  window.__name = function (fn: any) {
    return fn;
  };
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { success?: boolean; role?: string; error?: string };

      if (!res.ok) {
        if (res.status === 403 || data.error === 'PENDING_APPROVAL') {
          window.location.href = '/awaiting-approval';
          return;
        }
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      if (onSuccess) onSuccess();
      // Successful login: hard refresh to load workspace layout with the new cookie
      window.location.href = '/';
    } catch (err: any) {
      setError('Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
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
