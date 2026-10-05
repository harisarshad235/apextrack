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
  FolderKanban,
  ChevronDown,
} from 'lucide-react';
import { User, Project } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleSelectUser = (userId: string) => {
    startTransition(() => {
      onSwitchPersona(userId);
    });
  };

  return (
    <aside
      className={`bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 z-30 border-r border-slate-800/80 ${
        sidebarOpen ? 'w-64' : 'w-18'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Kanban className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-base tracking-tight text-white block">ApexTrack</span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                  WORKSPACE
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Toggle Navigation Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Project Switcher in Sidebar */}
        {sidebarOpen && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
              <span>Active Project</span>
              <button
                onClick={onOpenProjectsModal}
                className="text-blue-400 hover:text-blue-300 capitalize text-[11px] font-semibold"
              >
                Manage
              </button>
            </div>
            <select
              value={activeProjectId}
              onChange={(e) => {
                if (e.target.value === '__manage__') {
                  onOpenProjectsModal();
                } else {
                  onSelectProject(e.target.value);
                }
              }}
              className="w-full bg-slate-800 text-xs text-white rounded-xl px-2.5 py-2 border border-slate-700/80 font-medium truncate focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.key}] {p.name}
                </option>
              ))}
              <option value="__manage__">⚙️ Projects Directory...</option>
            </select>
          </div>
        )}
      </div>

      {/* Active Sprint Progress Badge */}
      {sidebarOpen && (
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs shadow-inner">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Sprint Status</span>
            <span className="text-emerald-400 font-medium">Sprint 24 Active</span>
          </div>
          <div className="w-full bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
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
          onClick={() => setActiveTab('board')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'board'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Kanban className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Kanban Board</span>}
        </button>

        <button
          onClick={() => setActiveTab('backlog')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'backlog'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Backlog & Sprint</span>}
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'documents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && (
            <div className="flex items-center justify-between w-full">
              <span>Knowledge Base</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-md font-mono">
                Confluence
              </span>
            </div>
          )}
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'team'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && (
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
          onClick={() => setActiveTab('metrics')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'metrics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 flex-shrink-0" />
          {sidebarOpen && <span>Velocity Reports</span>}
        </button>
      </nav>

      {/* User Session Profile & Avatar Click-to-Edit */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        <div
          onClick={onOpenProfileModal}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition group"
          title="Click to manage profile and custom avatar"
        >
          <UserAvatar user={currentUser} size="md" className="ring-2 ring-blue-500" />
          {sidebarOpen && (
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
        {sidebarOpen && showDevSwitcher && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Switch Persona {isPending && '...'}
            </label>
            <select
              value={currentUser.id}
              disabled={isPending}
              onChange={(e) => handleSelectUser(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}) {u.status === 'PENDING' ? '[PENDING]' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </aside>
  );
}
