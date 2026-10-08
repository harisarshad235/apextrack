import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getWorkspaceData } from '@/lib/queries';
import { Workspace } from '@/components/Workspace';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connection(); // Ensures request-time evaluation for Cloudflare Workers D1 bindings

  const currentUser = await getCurrentUser();

  // Gatekeeper Redirects
  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.status === 'PENDING') {
    redirect('/awaiting-approval');
  }

  const { users, issues, docs, sprints, projects, swimlanes, metrics } =
    await getWorkspaceData();

  return (
    <Workspace
      currentUser={currentUser}
      users={users}
      issues={issues}
      docs={docs}
      sprints={sprints}
      projects={projects}
      swimlanes={swimlanes}
      metrics={metrics}
    />
  );
}
