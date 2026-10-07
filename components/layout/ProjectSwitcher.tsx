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
        style={{ colorScheme: 'dark' }}
        onChange={(e) => {
          if (e.target.value === '__manage__') {
            onOpenProjectsModal?.();
          } else {
            onSelectProject(e.target.value);
          }
        }}
        className="w-full appearance-none bg-zinc-900/90 text-zinc-100 font-medium text-xs border border-white/10 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-zinc-800 transition cursor-pointer"
        aria-label="Active Project Switcher"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id} className="text-zinc-200 bg-zinc-900 font-medium py-1">
            [{p.key}] {p.name}
          </option>
        ))}
        {onOpenProjectsModal && (
          <option value="__manage__" className="text-zinc-200 bg-zinc-900 font-medium py-1">
            ⚙️ Projects Directory...
          </option>
        )}
      </select>
      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
