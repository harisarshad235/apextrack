import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getWorkspaceData } from '@/lib/queries';
import { MetricsReportView } from '@/components/metrics/MetricsReport';
import Link from 'next/link';
import { ArrowLeft, Kanban } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectReportsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await connection();
  const { projectId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const { users, issues, sprints, metrics, projects } = await getWorkspaceData();

  const currentProject = projects.find((p) => p.id === projectId) || projects[0];
  const projectIssues = issues.filter((i) => !i.projectId || i.projectId === projectId);
  const projectSprints = sprints;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 p-4 md:p-8 space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between border-b border-[#263348] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/?projectId=${projectId}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151c28] border border-[#263348] text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Board</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-400 text-sm">{currentProject?.key}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300 text-sm font-semibold">{currentProject?.name}</span>
          </div>
        </div>
      </div>

      <MetricsReportView
        issues={projectIssues}
        users={users}
        metrics={metrics}
        sprints={projectSprints}
      />
    </div>
  );
}
