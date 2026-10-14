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
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Zap,
} from 'lucide-react';
import { User, Project } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { KynovLogo } from '@/components/brand/KynovLogo';
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
    window.addEventListener('kynov:sprint-updated', handleSprintUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('kynov:sprint-updated', handleSprintUpdate);
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

  const navItems = [
    { id: 'board', label: 'Kanban Board', icon: Kanban, badge: null },
    { id: 'backlog', label: 'Sprint Backlog', icon: Layers, badge: null },
    { id: 'documents', label: 'Knowledge Base', icon: FileText, badge: 'Docs' },
    {
      id: 'team',
      label: 'Team & Capacity',
      icon: Users,
      badge: pendingCount > 0 && isAdmin ? `${pendingCount} Req` : isAdmin ? 'Admin' : null,
      badgePulse: pendingCount > 0 && isAdmin,
    },
    { id: 'metrics', label: 'Velocity Reports', icon: BarChart3, badge: null },
  ];

  return (
    <aside
      className={`bg-white dark:bg-[#11141B] text-slate-600 dark:text-slate-400 flex flex-col transition-all duration-300 ease-in-out md:rounded-2xl md:border md:border-slate-200/80 dark:md:border-[#232836] shadow-sm overflow-hidden flex-shrink-0 ${
        mobileOpen
          ? 'fixed inset-y-0 left-0 z-50 w-72 translate-x-0 shadow-2xl md:shadow-none'
          : 'fixed inset-y-0 left-0 z-50 w-72 -translate-x-full md:translate-x-0 md:static md:z-30'
      } ${sidebarOpen ? 'md:w-64' : 'md:w-18'}`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-slate-200/80 dark:border-[#232836]">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            {sidebarOpen || mobileOpen ? (
              <div className="transition-all duration-300 ease-in-out hover:scale-[1.02]">
                <KynovLogo
                  size="md"
                  variant="full"
                  subtitle="Agile Velocity & Tracking"
                  className="flex-shrink-0"
                />
              </div>
            ) : (
              <div
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-[#171B24] border border-[#232836] rounded-xl transition-all duration-200 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
                title="Expand Kynov Command Sidebar"
              >
                <KynovLogo size="sm" variant="icon" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#171B24] text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Toggle collapse on desktop */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#171B24] text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title={sidebarOpen ? 'Collapse to Icon Rail' : 'Expand Sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Workspace Switcher in Sidebar */}
        {(sidebarOpen || mobileOpen) && (
          <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-[#232836]">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1.5 tracking-wider font-mono">
              <span>Workspace</span>
              <button
                onClick={() => {
                  onOpenProjectsModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="text-cyan-600 dark:text-cyan-400 hover:underline capitalize text-[11px] font-semibold cursor-pointer"
              >
                Settings
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
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-slate-50 dark:bg-[#0A0C10] border border-slate-200/70 dark:border-[#232836] text-xs transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="font-semibold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Active Sprint
            </span>
            <span
              className={`font-semibold text-xs ${
                activeSprint
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {activeSprint ? activeSprint.name : 'No Active Sprint'}
            </span>
          </div>

          {activeSprint ? (
            <>
              <div className="w-full bg-slate-200/80 dark:bg-[#171B24] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${sprintCompletionRate}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-mono">
                <span>
                  {sprintCompletedPoints}/{sprintTotalPoints} pts
                </span>
                <span className="text-cyan-400 font-bold">{sprintCompletionRate}%</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-sans">
              <span className="text-[11px] text-slate-500 font-mono">0 pts</span>
              <button
                type="button"
                onClick={() => handleNavClick('backlog')}
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 font-medium hover:underline cursor-pointer transition text-[11px]"
              >
                Plan Backlog →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-none">
        <div className="px-3 pt-1 pb-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono">
            {sidebarOpen || mobileOpen ? 'Navigation' : '•••'}
          </span>
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] relative group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-[#171B24] dark:to-[#171B24] text-white font-semibold shadow-sm border border-transparent dark:border-[#343C50]'
                  : 'hover:bg-slate-100 dark:hover:bg-[#171B24]/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={item.label}
            >
              {/* Active Neon Accent Left Bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
              )}

              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  isActive
                    ? 'text-cyan-400 scale-105'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-300'
                }`}
              />

              {(sidebarOpen || mobileOpen) && (
                <div className="flex items-center justify-between w-full min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-semibold ${
                        item.badgePulse
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-100 dark:bg-[#0A0C10] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#232836]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Profile & Settings */}
      <div className="p-3 border-t border-slate-200/80 dark:border-[#232836] bg-slate-50/50 dark:bg-[#0A0C10]/60 transition-colors">
        <div
          onClick={() => {
            onOpenProfileModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#171B24] cursor-pointer transition group"
          title="Manage user profile and credentials"
        >
          <UserAvatar user={currentUser} size="md" className="ring-1.5 ring-slate-200 dark:ring-[#232836]" />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-cyan-400 transition">
                  {currentUser.name}
                </p>
                <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium border ${
                    currentUser.role === 'Admin'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      : currentUser.role === 'Member'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      : 'bg-slate-100 dark:bg-[#171B24] text-slate-400 border-slate-200 dark:border-[#232836]'
                  }`}
                >
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {currentUser.department || 'Engineering'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher (Dev Mode) */}
        {(sidebarOpen || mobileOpen) && showDevSwitcher && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 dark:border-[#232836]">
            <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1 font-mono tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Switch Persona {isPending && '...'}
            </label>
            <div className="relative">
              <select
                value={currentUser.id}
                disabled={isPending}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#11141B] text-slate-700 dark:text-slate-300 font-medium text-xs rounded-lg pl-2.5 pr-8 py-1.5 border border-slate-200/80 dark:border-[#232836] focus:outline-none focus:ring-1 focus:ring-cyan-500 hover:border-[#343C50] transition cursor-pointer"
              >
                {users.map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                    className="text-slate-800 dark:text-slate-200 bg-white dark:bg-[#11141B] font-medium py-1"
                  >
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

export default Sidebar;
