import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ShieldAlert, RefreshCw, LogOut, CheckCircle2, Clock } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { logoutUser } from '@/app/actions/auth';
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function AwaitingApprovalPage() {
  await connection();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // If user is already APPROVED, redirect to main workspace
  if (currentUser.status === 'APPROVED') {
    redirect('/');
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 dark:border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center z-10 transition-colors">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <ApexTrackLogo size={44} className="mb-2" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg text-slate-900 dark:text-white">ApexTrack</span>
            <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded">
              GATEKEEPER
            </span>
          </div>
        </div>

        {/* Pulsing Alert Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 mx-auto flex items-center justify-center mb-4 border border-amber-500/40 animate-pulse">
          <Clock className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Account Pending Approval
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          Welcome <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({currentUser.email}). Your account has been registered and is waiting for administrator authorization.
        </p>

        {/* User Credential Snapshot */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-6 space-y-2 text-left font-mono">
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
            <span className="text-slate-400">Account Status</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              PENDING REVIEW
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1.5">
            <span className="text-slate-400">Assigned Role</span>
            <span className="font-semibold">{currentUser.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Department</span>
            <span>{currentUser.department || 'Engineering'}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          An Organization Administrator (such as Alex Chen) must verify your identity and activate your seat before you can access the Kanban board and documentation spaces.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/awaiting-approval"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Check Approval Status
          </a>

          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
