'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { registerUser } from '@/app/actions/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Please provide your full name and work email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    startTransition(async () => {
      const res = await registerUser({ name, email, password, department });
      if (res.success) {
        if (onSuccess) onSuccess();
        router.push(res.redirect || '/awaiting-approval');
      } else {
        setError(res.error || 'Registration failed');
      }
    });
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4 text-xs">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Full Name *
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Jordan Vance"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Work Email Address *
        </label>
        <input
          type="email"
          required
          placeholder="jordan.v@apextrack.io"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Password *
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Minimum 6 characters"
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

      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          Department
        </label>
        <input
          type="text"
          placeholder="Frontend, Backend, DevOps, QA, Product"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
        />
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
        🔒 <strong>Gated Security:</strong> New self-registered accounts are assigned <strong>Viewer</strong> privileges and land in the <strong>PENDING</strong> holding state until approved by an Organization Admin.
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm shadow-md transition active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" /> Create Account & Enter Approval Queue
          </>
        )}
      </button>
    </form>
  );
}
