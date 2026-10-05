import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { ShieldAlert, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { logoutUser } from '@/app/actions/auth';

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
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center z-10">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-5 border border-amber-500/40 animate-pulse">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Account Pending Approval</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Welcome <strong className="text-white">{currentUser.name}</strong> ({currentUser.email}). Your account is currently in the holding queue.
        </p>

        <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 mb-6 space-y-2 text-left font-mono">
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Status</span>
            <span className="text-amber-400 font-bold">PENDING APPROVAL</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Role</span>
            <span>{currentUser.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department</span>
            <span>{currentUser.department || 'Engineering'}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mb-6">
          An Organization Admin (e.g. Alex Chen) must approve your seat before you can view project tickets or documentation.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/awaiting-approval"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Check Approval Status
          </a>

          <form action={logoutUser}>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
