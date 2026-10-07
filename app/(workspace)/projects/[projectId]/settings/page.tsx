import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { verifyProjectAccess } from '@/lib/rbac';
import { projects, users } from '@/db/schema';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';
import { Settings, FolderKanban, ArrowLeft, Shield } from 'lucide-react';

interface ProjectSettingsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Access check
  const hasAccess = await verifyProjectAccess(currentUser.id, projectId);
  if (!hasAccess) {
    redirect('/dashboard?error=unauthorized_project');
  }

  const db = getDb();
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    notFound();
  }

  const allUsers = await db.select().from(users);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workspace</span>
          </a>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm tracking-wider font-mono shadow-md">
                {project.key}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">{project.name}</h1>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Settings
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {project.description || 'Configure project governance, access control, and team members.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="border-b border-slate-800 flex items-center gap-6 text-sm">
          <div className="pb-3 border-b-2 border-blue-500 font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span>Members & Access</span>
          </div>
        </div>

        {/* Project Members Tab */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <ProjectMembersPanel
            projectId={project.id}
            currentUser={currentUser}
            allUsers={allUsers}
          />
        </div>
      </div>
    </div>
  );
}
