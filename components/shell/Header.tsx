'use client';

import React from 'react';
import { Search, Plus, FileUp, X, LogOut, Menu } from 'lucide-react';
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
}: HeaderProps) {
  return (
    <header className="h-16 bg-white/90 dark:bg-[#0e0e11]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between px-4 md:px-6 z-20 flex-shrink-0 transition-colors w-full">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Menu Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex-shrink-0"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues, keys (e.g. APEX-101), labels, docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs md:text-sm bg-slate-100/80 dark:bg-zinc-900/80 border border-black/[0.06] dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900 dark:text-zinc-100 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* In-app @mention notifications */}
        <NotificationBell onSelectIssue={onSelectIssue} />

        {/* Quick Create Issue Action */}
        <button
          onClick={onOpenCreateIssue}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold shadow-xs transition active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Issue</span>
        </button>

        {/* Knowledge Base Document Action */}
        <button
          onClick={onOpenCreateDoc}
          className="hidden sm:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold border border-black/[0.06] dark:border-white/[0.08] transition"
        >
          <FileUp className="w-4 h-4" />
          <span>New Doc</span>
        </button>

        {/* User Avatar & Profile Quick Trigger */}
        <button
          onClick={onOpenProfileModal}
          className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-500 transition flex-shrink-0"
          title={`Signed in as ${currentUser.name} — Click to manage profile & avatar`}
        >
          <UserAvatar user={currentUser} size="sm" />
        </button>

        {/* Logout button */}
        <form action={logoutUser}>
          <button
            type="submit"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  );
}

