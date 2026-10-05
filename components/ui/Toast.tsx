'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface Notification {
  message: string;
  type?: 'success' | 'error';
}

interface ToastProps {
  notification: Notification | null;
  onClose: () => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  if (!notification) return null;
  const isErr = notification.type === 'error';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium border transition-all animate-bounce-in ${
        isErr
          ? 'bg-red-900/90 text-white border-red-700'
          : 'bg-slate-900/95 text-white border-slate-700'
      }`}
    >
      {isErr ? (
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      )}
      <span>{notification.message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75 p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
