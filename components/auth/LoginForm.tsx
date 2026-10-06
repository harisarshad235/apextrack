'use client';

import React, { useState } from 'react';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });

      if (!res?.success) {
        if (res?.error === 'PENDING_APPROVAL') {
          window.location.href = '/awaiting-approval';
          return;
        }
        setError(res?.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Hard redirect to load session cookie into workspace layout
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login action error:', err);
      setError(err?.message || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-medium text-zinc-400 mb-1">
          Work Email Address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-xs font-medium text-zinc-400 mb-1">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <button
        id="login-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition duration-150 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Verifying credentials...' : 'Sign In to Workspace'}
      </button>
    </form>
  );
}

export { LoginForm };
