import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { verifyProjectAccess } from '@/lib/rbac';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  if (currentUser.status === 'PENDING') {
    redirect('/awaiting-approval');
  }

  // Server-side check: Call verifyProjectAccess(currentUser.id, params.projectId)
  const hasAccess = await verifyProjectAccess(currentUser.id, projectId);

  if (!hasAccess) {
    redirect('/dashboard?error=unauthorized_project');
  }

  return <>{children}</>;
}
