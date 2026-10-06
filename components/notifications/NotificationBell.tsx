'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, AtSign } from 'lucide-react';
import { getMyNotifications, markNotificationsRead } from '@/app/actions/issues';
import { AppNotification } from '@/lib/types';

interface NotificationBellProps {
  onSelectIssue?: (issueKey: string) => void;
}

export function NotificationBell({ onSelectIssue }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await getMyNotifications();
    if (res.success) setItems(res.notifications);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  const markAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await markNotificationsRead();
  };

  const openItem = async (n: AppNotification) => {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    void markNotificationsRead([n.id]);
    if (n.issueId && onSelectIssue) onSelectIssue(n.issueId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mentions &amp; Alerts</span>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="p-6 text-center text-xs text-slate-400 italic">No notifications yet.</p>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => openItem(n)}
                className={`w-full text-left flex gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition ${
                  n.read ? '' : 'bg-blue-50/60 dark:bg-blue-950/20'
                }`}
              >
                <AtSign className="w-3.5 h-3.5 mt-0.5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug break-words">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {n.createdAt.replace('T', ' ').substring(0, 16)}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 mt-1 rounded-full bg-blue-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
