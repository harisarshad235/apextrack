'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Layers,
  FileText,
  Users,
  BarChart3,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Rocket,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  ExternalLink,
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

  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge: string | null;
    badgePulse?: boolean;
    href?: string;
  }

  // Grouped Navigation structure matching SaaSable Screenshot 2
  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'Manage',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'board', label: 'Kanban Board', icon: Kanban, badge: null },
        { id: 'backlog', label: 'Sprint Backlog', icon: Layers, badge: null },
      ],
    },
    {
      title: 'Knowledge',
      items: [
        { id: 'documents', label: 'Documentation', icon: FileText, badge: 'Docs' },
      ],
    },
    {
      title: 'Team & Org',
      items: [
        {
          id: 'team',
          label: 'Team Management',
          icon: Users,
          badge: pendingCount > 0 && isAdmin ? `${pendingCount} Req` : isAdmin ? 'Admin' : null,
          badgePulse: pendingCount > 0 && isAdmin,
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        { id: 'metrics', label: 'Velocity & Metrics', icon: BarChart3, badge: null },
      ],
    },
    {
      title: 'Explore',
      items: [
        { id: 'landing', label: 'Landing & Features', icon: Globe, badge: 'Showcase', href: '/landing' },
      ],
    },
  ];

  return (
    <aside
      className={`bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-slate-400 flex flex-col transition-all duration-300 ease-in-out md:border-r border-slate-200/80 dark:border-[#1E2538] shadow-xs overflow-hidden flex-shrink-0 ${
        mobileOpen
          ? 'fixed inset-y-0 left-0 z-50 w-72 translate-x-0 shadow-2xl md:shadow-none'
          : 'fixed inset-y-0 left-0 z-50 w-72 -translate-x-full md:translate-x-0 md:static md:z-30'
      } ${sidebarOpen ? 'md:w-64' : 'md:w-20'}`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-[#1E2538]">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            {sidebarOpen || mobileOpen ? (
              <div
                onClick={() => handleNavClick('dashboard')}
                className="cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
              >
                <KynovLogo size={28} variant="full" />
              </div>
            ) : (
              <div
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 hover:border-indigo-500/50 cursor-pointer"
                title="Expand Kynov Sidebar"
              >
                <KynovLogo size={22} variant="icon" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Desktop collapse toggle (matching SaaSable Screenshot 2 icon button) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-800 transition cursor-pointer"
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Project Switcher */}
        {(sidebarOpen || mobileOpen) && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#1E2433]">
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

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto scrollbar-none">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {(sidebarOpen || mobileOpen) ? (
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
            ) : (
              <div className="text-center text-[10px] text-slate-400 dark:text-slate-600 pb-1">
                •••
              </div>
            )}

            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              const content = (
                <>
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 scale-105'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                    }`}
                  />

                  {(sidebarOpen || mobileOpen) && (
                    <div className="flex items-center justify-between w-full min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            item.badgePulse
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 animate-pulse'
                              : isActive
                              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </>
              );

              const className = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer active:scale-[0.98] group relative ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`;

              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={className}
                    title={item.label}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={className}
                  title={item.label}
                >
                  {content}
                </button>
              );
            })}
          </div>
        ))}

        {/* Upgrade Pro Card (Directly matching SaaSable Screenshot 2 sidebar card) */}
        {(sidebarOpen || mobileOpen) && (
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/70 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold shadow-xs">
                  <Rocket className="w-3 h-3" /> v2.4.0
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Kynov Platform
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Real-time agile sprint acceleration, velocity metrics, and docs.
                </p>
              </div>
              <a
                href="/landing"
                className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-white dark:bg-[#161C2E] hover:bg-slate-50 dark:hover:bg-[#1E2538] text-indigo-600 dark:text-indigo-400 font-semibold text-xs border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs transition active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Go to Landing & Features</span>
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-[#1E2433] bg-slate-50/50 dark:bg-[#0A0C10]/60">
        <div
          onClick={() => {
            onOpenProfileModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition group"
          title="Manage account settings"
        >
          <UserAvatar user={currentUser} size="md" />
          {(sidebarOpen || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {currentUser.name}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {currentUser.role} • {currentUser.department || 'Engineering'}
              </p>
            </div>
          )}
        </div>

        {/* Persona Switcher in Dev */}
        {(sidebarOpen || mobileOpen) && showDevSwitcher && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#1E2433]">
            <div className="relative">
              <select
                value={currentUser.id}
                disabled={isPending}
                onChange={(e) => handleSelectUser(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-[#11141B] text-slate-600 dark:text-slate-300 font-medium text-[11px] rounded-lg pl-2 pr-7 py-1.5 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
