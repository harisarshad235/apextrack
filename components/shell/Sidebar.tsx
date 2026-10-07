'use client';

import React, { useTransition } from 'react';
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
import { ApexTrackLogo } from '@/components/ui/ApexTrackLogo';

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
      className={`bg-[#0e0e11] dark:bg-[#09090b] text-slate-300 flex flex-col transition-all duration-200 ease-in-out border-r border-black/[0.06] dark:border-white/[0.08] ${
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
      <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <ApexTrackLogo size={34} className="flex-shrink-0" />
            {(sidebarOpen || mobileOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">ApexTrack</span>
                  <span className="text-[9px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1 py-0.2 rounded">
                    v1.0
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase">
                  ENTERPRISE WORKSPACE
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Toggle collapse on desktop */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Toggle Navigation Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Switcher in Sidebar */}
        {(sidebarOpen || mobileOpen) && (
          <div className="mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider font-mono">
              <span>Active Project</span>
              <button
                onClick={() => {
                  onOpenProjectsModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="text-blue-500 hover:text-blue-400 capitalize text-[11px] font-semibold"
              >
                Manage
              </button>
            </div>
            <div className="relative">
              <select
                value={activeProjectId}
                style={{ colorScheme: 'dark' }}
                onChange={(e) => {
                  if (e.target.value === '__manage__') {
                    onOpenProjectsModal();
                    if (onCloseMobile) onCloseMobile();
                  } else {
                    onSelectProject(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-zinc-900/90 text-zinc-100 font-medium text-xs border border-white/10 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-zinc-800 transition cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="text-zinc-200 bg-zinc-900 font-medium py-1">
                    [{p.key}] {p.name}
                  </option>
                ))}
                <option value="__manage__" className="text-zinc-200 bg-zinc-900 font-medium py-1">
                  ⚙️ Projects Directory...
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Active Sprint Progress Badge */}
      {(sidebarOpen || mobileOpen) && (
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-800/40 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Sprint Status</span>
            <span className="text-emerald-400 font-medium">Sprint 24 Active</span>
          </div>
          <div className="w-full bg-slate-700/60 dark:bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
            <span>
              {completedPoints}/{totalPoints} pts
            </span>
            <span>{completionRate}% complete</span>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <button
          onClick={() => handleNavClick('board')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'board'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Kanban className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobileOpen) && <span>Kanban Board</span>}
        </button>

        <button
          onClick={() => handleNavClick('backlog')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'backlog'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobileOpen) && <span>Backlog & Sprint</span>}
        </button>

        <button
          onClick={() => handleNavClick('documents')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex items-center justify-between w-full">
              <span>Knowledge Base</span>
              <span className="text-[10px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                Confluence
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => handleNavClick('team')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'team'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex items-center justify-between w-full">
              <span>Team & Access</span>
              {pendingCount > 0 && isAdmin ? (
                <span className="text-[10px] bg-amber-500 text-slate-900 px-1.5 py-0.5 rounded-md font-bold animate-pulse">
                  {pendingCount} Pending
                </span>
              ) : (
                isAdmin && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md font-mono">
                    Admin
                  </span>
                )
              )}
            </div>
          )}
        </button>

        <button
          onClick={() => handleNavClick('metrics')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'metrics'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 flex-shrink-0" />
          {(sidebarOpen || mobileOpen) && <span>Velocity Reports</span>}
        </button>
      </nav>

      {/* User Session Profile & Avatar Click-to-Edit */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#0e0e11] dark:bg-[#09090b]">
        <div
          onClick={() => {
            onOpenProfileModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition group"
          title="Click to manage profile and custom avatar"
        >
          <UserAvatar user={currentUser} size="md" className="ring-2 ring-blue-500" />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition">
                  {currentUser.name}
                </p>
                <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                    currentUser.role === 'Admin'
                      ? 'bg-amber-500/20 text-amber-300'
                      : currentUser.role === 'Member'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {currentUser.department || 'Team'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher (Dev Mode Only) */}
        {(sidebarOpen || mobileOpen) && showDevSwitcher && (
          <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" /> Switch Persona {isPending && '...'}
            </label>
            <div className="relative">
              <select
                value={currentUser.id}
                disabled={isPending}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="w-full appearance-none bg-zinc-900/90 text-zinc-100 font-medium text-xs rounded-lg pl-2.5 pr-8 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-zinc-800 transition cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="text-zinc-200 bg-zinc-900 font-medium py-1">
                    {u.name} ({u.role}) {u.status === 'PENDING' ? '[PENDING]' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

