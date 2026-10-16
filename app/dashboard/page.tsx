'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Workspace } from '@/components/Workspace';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import type {
  FullIssue,
  FullDocument,
  WorkspaceMetrics,
  User,
  Sprint,
  Project,
  Swimlane,
} from '@/lib/types';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface WorkspaceData {
  currentUser: User;
  users: User[];
  issues: FullIssue[];
  docs: FullDocument[];
  sprints: Sprint[];
  projects: Project[];
  swimlanes: Swimlane[];
  metrics: WorkspaceMetrics;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const res = await fetch('/api/dashboard', {
          headers: {
            Accept: 'application/json',
          },
        });

        if (res.status === 401) {
          router.replace('/login');
          return;
        }

        if (res.status === 403) {
          router.replace('/awaiting-approval');
          return;
        }

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData?.error || `Failed to fetch workspace data (${res.status})`);
        }

        const json: WorkspaceData = await res.json();
        setData(json);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        if (!isBackground) {
          setError(err?.message || 'Failed to connect to workspace database');
        }
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [router]
  );

  useEffect(() => {
    fetchData();

    // Re-sync on window focus after idle
    const handleFocus = () => fetchData(true);
    window.addEventListener('focus', handleFocus);

    // Support custom manual refresh trigger
    const handleCustomRefresh = () => fetchData(true);
    window.addEventListener('kynov:refresh-data', handleCustomRefresh);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('kynov:refresh-data', handleCustomRefresh);
    };
  }, [fetchData]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#080d1a] text-slate-100 p-4">
        <div className="max-w-md w-full bg-[#0e1628] border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Connection Error</h2>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={() => fetchData(false)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  return (
    <Workspace
      currentUser={data.currentUser}
      users={data.users}
      issues={data.issues}
      docs={data.docs}
      sprints={data.sprints}
      projects={data.projects}
      swimlanes={data.swimlanes}
      metrics={data.metrics}
    />
  );
}
