'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { ChevronDown, FolderKanban } from 'lucide-react';
import { Project, User } from '@/lib/types';
import { getUserProjectsAction } from '@/app/actions/projects';

interface ProjectSwitcherProps {
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectsModal?: () => void;
  initialProjects?: Project[];
  currentUser?: User;
  className?: string;
}

export function ProjectSwitcher({
  activeProjectId,
  onSelectProject,
  onOpenProjectsModal,
  initialProjects = [],
  currentUser,
  className = '',
}: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isPending, startTransition] = useTransition();

  const fetchAccessibleProjects = () => {
    startTransition(async () => {
      try {
        const accessible = await getUserProjectsAction();
        if (accessible && accessible.length > 0) {
          setProjects(accessible);
          // If the currently selected project is not accessible to this user, auto-select first accessible project
          if (!accessible.some((p) => p.id === activeProjectId)) {
            onSelectProject(accessible[0].id);
          }
        } else if (accessible) {
          setProjects(accessible);
        }
      } catch (err) {
        console.error('Failed to load user projects:', err);
      }
    });
  };

  useEffect(() => {
    fetchAccessibleProjects();
  }, [currentUser?.id, currentUser?.role]);

  return (
    <div className={`relative ${className}`}>
      <select
        value={activeProjectId}
        onChange={(e) => {
          if (e.target.value === '__manage__') {
            onOpenProjectsModal?.();
          } else {
            onSelectProject(e.target.value);
          }
        }}
        className="w-full appearance-none bg-slate-100/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200/80 dark:border-slate-800/80 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition cursor-pointer"
        aria-label="Active Project Switcher"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium py-1">
            [{p.key}] {p.name}
          </option>
        ))}
        {onOpenProjectsModal && (
          <option value="__manage__" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium py-1">
            ⚙️ Projects Directory...
          </option>
        )}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
