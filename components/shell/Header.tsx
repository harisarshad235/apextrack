'use client';

import React from 'react';
import {
  Search,
  Plus,
  X,
  LogOut,
  Menu,
  Clock,
  ChevronRight,
  Command,
  Globe,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { logoutUser } from '@/app/actions/auth';
import { User } from '@/lib/types';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User;
  isViewer: boolean;
  onOpenCreateIssue: () => void;
  onOpenCreateDoc: () => void;
  onOpenProfileModal: () => void;
  onSelectIssue?: (issueKey: string) => void;
  onToggleMobileSidebar?: () => void;
  onOpenCommandPalette?: () => void;
  activeProjectName?: string;
  activeTab?: string;
  users?: User[];
  daysRemaining?: number;
}

export function Header({
  searchQuery,
  setSearchQuery,
  currentUser,
  isViewer,
  onOpenCreateIssue,
  onOpenProfileModal,
  onSelectIssue,
  onToggleMobileSidebar,
  onOpenCommandPalette,
  activeProjectName = 'Core Engine',
  activeTab = 'dashboard',
  daysRemaining = 6,
}: HeaderProps) {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'board':
        return 'Kanban Board';
      case 'backlog':
        return 'Sprint Backlog';
      case 'documents':
        return 'Knowledge Base';
      case 'organization':
        return 'Organization Hub';
      case 'team':
        return 'Team Management';
      case 'metrics':
        return 'Velocity & Metrics';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="relative h-16 bg-white dark:bg-[#0D121D] border-b border-slate-200/90 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-30 flex-shrink-0 transition-colors w-full">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {getTabLabel(activeTab)}
          </h1>
          {activeTab !== 'dashboard' && (
            <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium pl-2 border-l border-slate-200 dark:border-slate-800">
              <span>{activeProjectName}</span>
            </span>
          )}
        </div>
      </div>

      {/* Right Tools: Search Bar, Actions, Theme, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
        {/* Global Search Bar (SaaSable Screenshot 2 Search Pill) */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenCommandPalette}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
                title="Command Palette"
              >
                <span>⌘</span>
                <span>K</span>
              </button>
            )}
          </div>
        </div>

        {/* Go to Landing / Feature Page Link */}
        <a
          href="/landing"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-[#161C2E] dark:hover:bg-[#1E2538] border border-slate-200/80 dark:border-slate-800 transition shadow-2xs active:scale-95"
          title="Visit Public Landing & Features"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-500" />
          <span>Landing Page</span>
        </a>

        {/* Quick Issue Creation Button */}
        {!isViewer && (
          <button
            onClick={onOpenCreateIssue}
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#2D3FEA] hover:bg-[#2031D8] text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        )}

        {/* Theme Toggle (Sun/Moon) */}
        <ThemeToggle />

        {/* In-app Notifications Bell with unread dot */}
        <NotificationBell onSelectIssue={onSelectIssue} />

        {/* User Profile Lockup (Matching SaaSable Screenshot 2 Header) */}
        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer"
          title={`Signed in as ${currentUser.name}`}
        >
          <UserAvatar user={currentUser} size="sm" />
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
              {currentUser.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium capitalize">
              {currentUser.role === 'Admin' ? 'Super Admin' : currentUser.role}
            </span>
          </div>
        </button>

        {/* Sign Out */}
        <form action={logoutUser}>
          <button
            type="submit"
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}

export default Header;
