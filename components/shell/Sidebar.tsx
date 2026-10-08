'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Kanban,
  Layers,
  FileText,
  Users,
  BarChart3,
  Menu,
  Sparkles,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react';
import { User, Project } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ApexLogo } from '@/components/brand/ApexLogo';
import { ProjectSwitcher } from '@/components/layout/ProjectSwitcher';
import { getActiveSprintMetricsAction, ActiveSprintMetrics } from '@/app/actions/sprints';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  currentUser: User;
  users: User[];
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectsModal: () => void;
  onOpenProfileModal: () => void;
  completionRate: number;
  completedPoints: number;
  totalPoints: number;
  onSwitchPersona: (userId: string) => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  mobileOpen = false,
  onCloseMobile,
  currentUser,
  users,
  projects,
  activeProjectId,
  onSelectProject,
  onOpenProjectsModal,
  onOpenProfileModal,
  completionRate,
  completedPoints,
  totalPoints,
  onSwitchPersona,
}: SidebarProps) {
  const [isPending, startTransition] = useTransition();

  const [sprintMetrics, setSprintMetrics] = useState<ActiveSprintMetrics | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadMetrics() {
      try {
        const data = await getActiveSprintMetricsAction(activeProjectId);
        if (isMounted) {
          setSprintMetrics(data);
        }
      } catch (err) {
        console.error('Failed to load active sprint metrics:', err);
        if (isMounted) {
          setSprintMetrics(null);
        }
      }
    }

    loadMetrics();

    const handleSprintUpdate = () => {
      loadMetrics();
    };
    window.addEventListener('apextrack:sprint-updated', handleSprintUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('apextrack:sprint-updated', handleSprintUpdate);
    };
  }, [activeProjectId]);

  const activeSprint = sprintMetrics?.activeSprint || null;
  const sprintTotalPoints = activeSprint ? (sprintMetrics?.totalPoints ?? 0) : 0;
  const sprintCompletedPoints = activeSprint ? (sprintMetrics?.completedPoints ?? 0) : 0;
  const sprintCompletionRate =
    activeSprint && sprintTotalPoints > 0
      ? Math.round((sprintCompletedPoints / sprintTotalPoints) * 100)
      : 0;

  const pendingCount = users.filter((u) => u.status === 'PENDING').length;
  const isAdmin = currentUser.role === 'Admin';
  const showDevSwitcher = process.env.NODE_ENV !== 'production';

  const handleSelectUser = (userId: string) => {
    startTransition(() => {
      onSwitchPersona(userId);
    });
  };

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`bg-white dark:bg-[#0c1017] text-slate-600 dark:text-slate-400 flex flex-col transition-all duration-200 ease-in-out border-r border-slate-200/80 dark:border-slate-800/80 ${
        /* Mobile off-canvas classes */
        mobileOpen
          ? 'fixed inset-y-0 left-0 z-50 w-72 translate-x-0 shadow-2xl md:shadow-none'
          : 'fixed inset-y-0 left-0 z-50 w-72 -translate-x-full md:translate-x-0 md:static md:z-30'
      } ${
        /* Desktop width toggle */
        sidebarOpen ? 'md:w-64' : 'md:w-18'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            <ApexLogo size={32} showWordmark={sidebarOpen || mobileOpen} className="flex-shrink-0" />
          </div>
          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Toggle collapse on desktop */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              title="Toggle Navigation Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Switcher in Sidebar */}
        {(sidebarOpen || mobileOpen) && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider font-mono">
              <span>Active Project</span>
              <button
                onClick={() => {
                  onOpenProjectsModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline capitalize text-[11px] font-semibold cursor-pointer"
              >
                Manage
              </button>
            </div>
            <ProjectSwitcher
              activeProjectId={activeProjectId}
              onSelectProject={onSelectProject}
              onOpenProjectsModal={() => {
                onOpenProjectsModal();
                if (onCloseMobile) onCloseMobile();
              }}
              initialProjects={projects}
              currentUser={currentUser}
            />
          </div>
        )}
      </div>

      {/* Active Sprint Progress Badge */}
      {(sidebarOpen || mobileOpen) && (
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 text-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="font-medium text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">Sprint Status</span>
            <span
              className={`font-semibold text-xs ${
                activeSprint
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {activeSprint ? `${activeSprint.name} Active` : 'No Active Sprint'}
            </span>
          </div>

          {activeSprint ? (
            <>
              <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${sprintCompletionRate}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                <span>
                  {sprintCompletedPoints}/{sprintTotalPoints} pts
                </span>
                <span>{sprintCompletionRate}% complete</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-sans">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">0/0 pts</span>
              <button
                type="button"
                onClick={() => handleNavClick('backlog')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium hover:underline cursor-pointer transition text-[11px]"
              >
                Plan Sprint in Backlog
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <button
          onClick={() => handleNavClick('board')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition cursor-pointer ${
            activeTab === 'board'
              ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Kanban className={`w-4 h-4 flex-shrink-0 ${activeTab === 'board' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
          {(sidebarOpen || mobileOpen) && <span>Kanban Board</span>}
        </button>

        <button
          onClick={() => handleNavClick('backlog')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition cursor-pointer ${
            activeTab === 'backlog'
              ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className={`w-4 h-4 flex-shrink-0 ${activeTab === 'backlog' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
          {(sidebarOpen || mobileOpen) && <span>Backlog & Sprint</span>}
        </button>

        <button
          onClick={() => handleNavClick('documents')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className={`w-4 h-4 flex-shrink-0 ${activeTab === 'documents' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex items-center justify-between w-full">
              <span>Knowledge Base</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 font-mono">
                Docs
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => handleNavClick('team')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition cursor-pointer ${
            activeTab === 'team'
              ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Users className={`w-4 h-4 flex-shrink-0 ${activeTab === 'team' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex items-center justify-between w-full">
              <span>Team & Access</span>
              {pendingCount > 0 && isAdmin ? (
                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {pendingCount} Pending
                </span>
              ) : (
                isAdmin && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    Admin
                  </span>
                )
              )}
            </div>
          )}
        </button>

        <button
          onClick={() => handleNavClick('metrics')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition cursor-pointer ${
            activeTab === 'metrics'
              ? 'bg-slate-100 dark:bg-slate-800/80 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
              : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className={`w-4 h-4 flex-shrink-0 ${activeTab === 'metrics' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
          {(sidebarOpen || mobileOpen) && <span>Velocity Reports</span>}
        </button>
      </nav>

      {/* User Session Profile & Avatar Click-to-Edit */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#090d16]/50 transition-colors">
        <div
          onClick={() => {
            onOpenProfileModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 cursor-pointer transition group"
          title="Click to manage profile and custom avatar"
        >
          <UserAvatar user={currentUser} size="md" className="ring-1.5 ring-slate-200 dark:ring-slate-700" />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {currentUser.name}
                </p>
                <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium border ${
                    currentUser.role === 'Admin'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                      : currentUser.role === 'Member'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {currentUser.department || 'Team'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher (Dev Mode Only) */}
        {(sidebarOpen || mobileOpen) && showDevSwitcher && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1 font-mono tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500" /> Switch Persona {isPending && '...'}
            </label>
            <div className="relative">
              <select
                value={currentUser.id}
                disabled={isPending}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg pl-2.5 pr-8 py-1.5 border border-slate-200/80 dark:border-slate-800/80 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium py-1">
                    {u.name} ({u.role}) {u.status === 'PENDING' ? '[PENDING]' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

