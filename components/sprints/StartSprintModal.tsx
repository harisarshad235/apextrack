'use client';

import React, { useState, useEffect } from 'react';
import { Play, Calendar, Clock, X, Loader2, AlertCircle, Target } from 'lucide-react';
import { Sprint } from '@/lib/types';
import { startSprintAction } from '@/app/actions/sprints';

interface StartSprintModalProps {
  sprint: Sprint;
  isOpen: boolean;
  onClose: () => void;
  onSprintStarted?: (sprint: Sprint) => void;
}

type DurationPreset = '1-week' | '2-weeks' | '3-weeks' | '4-weeks' | 'custom';

const DURATION_DAYS_MAP: Record<Exclude<DurationPreset, 'custom'>, number> = {
  '1-week': 7,
  '2-weeks': 14,
  '3-weeks': 21,
  '4-weeks': 28,
};

function formatYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatYMD(date);
}

export function StartSprintModal({
  sprint,
  isOpen,
  onClose,
  onSprintStarted,
}: StartSprintModalProps) {
  const todayYMD = formatYMD(new Date());
  const initialStart = sprint.startDate ? sprint.startDate.split('T')[0] : todayYMD;
  const initialEnd = sprint.endDate ? sprint.endDate.split('T')[0] : addDays(initialStart, 14);

  const [name, setName] = useState(sprint.name || '');
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [durationPreset, setDurationPreset] = useState<DurationPreset>('2-weeks');
  const [goal, setGoal] = useState(sprint.goal || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (durationPreset !== 'custom') {
      const days = DURATION_DAYS_MAP[durationPreset];
      if (startDate) {
        setEndDate(addDays(startDate, days));
      }
    }
  }, [durationPreset, startDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await startSprintAction({
        sprintId: sprint.id,
        name,
        startDate,
        endDate,
        goal,
      });

      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apextrack:sprint-updated'));
        }
        onSprintStarted?.({
          ...sprint,
          name,
          startDate,
          endDate,
          goal,
          state: 'active',
        });
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to start sprint.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Start Sprint: {sprint.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Activate this sprint to start tracking issues on the Kanban board.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sprint Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Duration
            </label>
            <select
              value={durationPreset}
              onChange={(e) => setDurationPreset(e.target.value as DurationPreset)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium"
            >
              <option value="1-week">1 week</option>
              <option value="2-weeks">2 weeks (Standard)</option>
              <option value="3-weeks">3 weeks</option>
              <option value="4-weeks">4 weeks</option>
              <option value="custom">Custom duration</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                disabled={durationPreset !== 'custom'}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sprint Goal
            </label>
            <textarea
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="What does the team aim to achieve in this sprint?"
              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Sprint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
