'use client';

import React from 'react';
import {
  Search,
  Plus,
  FileUp,
  X,
  LogOut,
  Menu,
  Clock,
  ChevronRight,
  Sparkles,
  Command,
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
  onOpenCreateDoc,
  onOpenProfileModal,
  onSelectIssue,
  onToggleMobileSidebar,
  onOpenCommandPalette,
  activeProjectName = 'Core Engine',
  activeTab = 'board',
  users = [],
  daysRemaining = 6,
}: HeaderProps) {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'board':
        return 'Kanban Board';
      case 'backlog':
        return 'Sprint Backlog';
      case 'documents':
        return 'Knowledge Base';
      case 'team':
        return 'Team & Capacity';
      case 'metrics':
        return 'Velocity & Metrics';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#11141B]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-[#232836] flex items-center justify-between px-4 md:px-6 z-20 flex-shrink-0 transition-colors w-full">
      <div className="flex items-center gap-3 flex-1 max-w-2xl min-w-0">
        {/* Mobile Hamburger Menu Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#171B24] transition active:scale-95 flex-shrink-0 cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Breadcrumb Header */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-400 flex-shrink-0 mr-2 select-none">
          <span className="font-bold text-slate-700 dark:text-slate-200">Kynov</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
            {activeProjectName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            {getTabLabel(activeTab)}
          </span>
        </div>

        {/* Global Search Bar with Keyboard Hint (Cmd+K) */}
        <div className="relative w-full group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 dark:group-focus-within:text-cyan-400 transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search issues, keys (e.g. KYN-101), docs... (Press ⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => {
              if (onOpenCommandPalette && !searchQuery) {
                // optional quick palette open
              }
            }}
            className="w-full pl-9 pr-14 py-2 text-xs md:text-sm bg-slate-100/80 dark:bg-[#0A0C10]/80 border border-slate-200/80 dark:border-[#232836] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 group-hover:border-slate-300 dark:group-hover:border-[#343C50]"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-[#171B24] transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-400 bg-slate-200/50 dark:bg-[#171B24] rounded border border-slate-300/60 dark:border-[#232836] hover:border-cyan-500/40 transition cursor-pointer shadow-2xs"
                title="Open Command Palette"
              >
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4 flex-shrink-0">
        {/* Active Sprint Countdown Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A0C10] border border-slate-200 dark:border-[#232836] text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Sprint Ends:</span>
          <span className="font-bold text-cyan-500 font-mono">{daysRemaining}d left</span>
        </div>

        {/* Grouped Team Avatars with presence status */}
        {users.length > 0 && (
          <div className="hidden 2xl:flex items-center -space-x-1.5 overflow-hidden pl-1">
            {users.slice(0, 4).map((u) => (
              <div
                key={u.id}
                className="relative inline-block ring-2 ring-[#11141B] rounded-full hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                title={`${u.name} (${u.role})`}
              >
                <UserAvatar user={u} size="xs" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black" />
              </div>
            ))}
            {users.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-[#171B24] border border-[#232836] text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center ring-2 ring-[#11141B]">
                +{users.length - 4}
              </div>
            )}
          </div>
        )}

        {/* In-app Notifications */}
        <NotificationBell onSelectIssue={onSelectIssue} />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Quick Create Issue Action */}
        <button
          onClick={onOpenCreateIssue}
          className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:via-blue-500 hover:to-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-cyan-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Issue</span>
        </button>

        {/* User Avatar & Profile Quick Trigger */}
        <button
          onClick={onOpenProfileModal}
          className="p-0.5 rounded-full hover:ring-2 hover:ring-cyan-500/60 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer ml-1"
          title={`Signed in as ${currentUser.name} — Click to manage profile & avatar`}
        >
          <UserAvatar user={currentUser} size="sm" />
        </button>

        {/* Logout button */}
        <form action={logoutUser}>
          <button
            type="submit"
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
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
