'use client';

import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2, CheckCircle2, Clock } from 'lucide-react';
import {
  getUserNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  clearNotificationAction,
  EnrichedNotification,
} from '@/app/actions/notifications';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface NotificationBellProps {
  onSelectIssue?: (issueKey: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    if (isNaN(date)) return 'recently';
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 10) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'recently';
  }
}

export function NotificationBell({ onSelectIssue }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<EnrichedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load notifications from server
  const loadNotifications = useCallback(async () => {
    try {
      const res = await getUserNotificationsAction({ limit: 30 });
      if (res.success) {
        setItems(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch {
      // Ignore background fetch error
    }
  }, []);

  // Poll notifications every 15s
  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  // Refresh upon opening
  const handleToggleOpen = () => {
    const nextState = !open;
    setOpen(nextState);
    if (nextState) {
      setIsLoading(true);
      loadNotifications().finally(() => setIsLoading(false));
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  // Open & mark single notification as read
  const handleItemClick = (n: EnrichedNotification) => {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      startTransition(async () => {
        await markNotificationAsReadAction(n.id);
      });
    }

    setOpen(false);

    // Deep link navigation
    if (n.issueId) {
      if (onSelectIssue) {
        onSelectIssue(n.issueId);
      }
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('issue', n.issueId);
        window.history.replaceState({}, '', url.toString());
      }
    } else if (n.linkUrl) {
      router.push(n.linkUrl);
    }
  };

  // Clear single notification
  const handleClearItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const target = items.find((x) => x.id === id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (target && !target.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    startTransition(async () => {
      await clearNotificationAction(id);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="relative p-2 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title="Notifications"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-75 duration-150">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {open && (
        <div className="fixed inset-x-4 top-16 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 max-w-sm w-96 max-h-[480px] overflow-hidden flex flex-col rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 backdrop-blur-xs flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {items.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading && items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Loading notifications...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  You're all caught up!
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  No notifications to display right now.
                </p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`group relative flex items-start gap-3 p-3.5 text-left transition cursor-pointer select-none ${
                    n.read
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {/* Actor Avatar */}
                  <div className="mt-0.5 flex-shrink-0">
                    <UserAvatar
                      user={n.author || { name: 'ApexTrack User' }}
                      size="sm"
                      className="ring-1 ring-black/5 dark:ring-white/10"
                    />
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                        {n.title || (n.issueId ? `Mention on ${n.issueId}` : 'ApexTrack Alert')}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(n.createdAt)}
                        </span>
                        {!n.read && (
                          <span
                            className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2 break-words">
                      {n.message}
                    </p>

                    {n.issueId && (
                      <span className="inline-block mt-1 font-mono text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
                        {n.issueId}
                      </span>
                    )}
                  </div>

                  {/* Delete / Clear button */}
                  <button
                    type="button"
                    onClick={(e) => handleClearItem(e, n.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition flex-shrink-0 self-start"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
