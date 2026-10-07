'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Sprint } from '@/lib/types';
import { updateSprintAction } from '@/app/actions/sprints';

interface EditSprintModalProps {
  sprint: Sprint;
  isOpen: boolean;
  onClose: () => void;
  onSprintUpdated?: (sprint: Sprint) => void;
}

type DurationPreset = '1-week' | '2-weeks' | '3-weeks' | '4-weeks' | 'custom';

const DURATION_DAYS_MAP: Record<Exclude<DurationPreset, 'custom'>, number> = {
  '1-week': 7,
  '2-weeks': 14,
  '3-weeks': 21,
  '4-weeks': 28,
};

function parseYMD(dateStr: string): { year: number; month: number; day: number } {
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = clean.split('-').map(Number);
  return {
    year: parts[0] || new Date().getFullYear(),
    month: parts[1] || new Date().getMonth() + 1,
    day: parts[2] || new Date().getDate(),
  };
}

function formatYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysToDate(dateStr: string, days: number): string {
  const { year, month, day } = parseYMD(dateStr);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatYMD(date);
}

function calculateDayDiff(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const s = parseYMD(startStr);
  const e = parseYMD(endStr);
  const startDate = new Date(s.year, s.month - 1, s.day);
  const endDate = new Date(e.year, e.month - 1, e.day);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function detectPreset(startStr: string, endStr: string): DurationPreset {
  const diff = calculateDayDiff(startStr, endStr);
  if (diff === 7) return '1-week';
  if (diff === 14) return '2-weeks';
  if (diff === 21) return '3-weeks';
  if (diff === 28) return '4-weeks';
  return 'custom';
}

function getTodayYMD(): string {
  return formatYMD(new Date());
}

export function EditSprintModal({
  sprint,
  isOpen,
  onClose,
  onSprintUpdated,
}: EditSprintModalProps) {
  // Normalize initial dates
  const initialStart = sprint.startDate
    ? sprint.startDate.includes('T')
      ? sprint.startDate.split('T')[0]
      : sprint.startDate
    : getTodayYMD();

  const initialEnd = sprint.endDate
    ? sprint.endDate.includes('T')
      ? sprint.endDate.split('T')[0]
      : sprint.endDate
    : addDaysToDate(initialStart, 14);

  const [name, setName] = useState(sprint.name || '');
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [durationPreset, setDurationPreset] = useState<DurationPreset>(() =>
    detectPreset(initialStart, initialEnd)
  );
  const [goal, setGoal] = useState(sprint.goal || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Handle Preset Dropdown change
  const handlePresetChange = (preset: DurationPreset) => {
    setDurationPreset(preset);
    setErrorMessage(null);

    if (preset !== 'custom') {
      const days = DURATION_DAYS_MAP[preset];
      const baseStart = startDate || getTodayYMD();
      setEndDate(addDaysToDate(baseStart, days));
    }
  };

  // Handle Start Date change
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setErrorMessage(null);

    // If preset is selected, automatically recalculate endDate relative to new startDate
    if (durationPreset !== 'custom') {
      const days = DURATION_DAYS_MAP[durationPreset];
      if (newStart) {
        setEndDate(addDaysToDate(newStart, days));
      }
    }
  };

  // Handle End Date change (only when Custom is selected or to switch to Custom)
  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    setErrorMessage(null);
    // If user modifies endDate manually, switch preset to custom
    setDurationPreset('custom');
  };

  // Form submission with optimistic UI and server action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMessage('Sprint name cannot be empty.');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage('Both start date and end date are required.');
      return;
    }

    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      setErrorMessage('Please select valid start and end dates.');
      return;
    }

    if (endMs <= startMs) {
      setErrorMessage('End date must be chronologically after start date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. Optimistic UI update
    const optimisticSprint: Sprint = {
      ...sprint,
      name: cleanName,
      startDate,
      endDate,
      goal: goal.trim() || null,
    };
    onSprintUpdated?.(optimisticSprint);

    // 2. Server Action execution
    try {
      const res = await updateSprintAction({
        sprintId: sprint.id,
        name: cleanName,
        startDate,
        endDate,
        goal: goal.trim() || null,
      });

      if (res.success) {
        if (res.sprint) {
          onSprintUpdated?.(res.sprint);
        }
        setIsSubmitting(false);
        onClose();
      } else {
        // Rollback optimistic update on error
        onSprintUpdated?.(sprint);
        setErrorMessage(res.error || 'Failed to update sprint.');
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      onSprintUpdated?.(sprint);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const calculatedDays = calculateDayDiff(startDate, endDate);
  const isDateChronological = new Date(endDate).getTime() > new Date(startDate).getTime();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-sprint-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="edit-sprint-title"
                className="font-bold text-base text-slate-900 dark:text-white"
              >
                Edit Sprint
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update sprint name, timeline presets, or custom dates.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Sprint Name Field */}
          <div>
            <label
              htmlFor="sprint-name-input"
              className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Sprint Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="sprint-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="e.g. Sprint 24"
              required
              disabled={isSubmitting}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60"
            />
          </div>

          {/* Duration Preset Selector */}
          <div>
            <label
              htmlFor="duration-preset-select"
              className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Duration Preset
            </label>
            <div className="relative">
              <select
                id="duration-preset-select"
                value={durationPreset}
                onChange={(e) => handlePresetChange(e.target.value as DurationPreset)}
                disabled={isSubmitting}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition cursor-pointer disabled:opacity-60"
              >
                <option value="1-week">1 Week (7 Days)</option>
                <option value="2-weeks">2 Weeks (14 Days - Standard)</option>
                <option value="3-weeks">3 Weeks (21 Days)</option>
                <option value="4-weeks">4 Weeks (28 Days)</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {durationPreset === 'custom'
                ? 'Custom mode enabled: Start and End dates are manually editable.'
                : `Preset active: End date automatically synced (${DURATION_DAYS_MAP[durationPreset]} days from Start Date).`}
            </p>
          </div>

          {/* Start Date & End Date Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Start Date */}
            <div>
              <label
                htmlFor="sprint-start-date"
                className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Start Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="sprint-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition cursor-pointer disabled:opacity-60"
              />
            </div>

            {/* End Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="sprint-end-date"
                  className="font-bold text-slate-700 dark:text-slate-300"
                >
                  End Date <span className="text-rose-500">*</span>
                </label>
                {durationPreset !== 'custom' && (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono font-medium">
                    Auto-calc
                  </span>
                )}
              </div>
              <input
                id="sprint-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                required
                disabled={isSubmitting || durationPreset !== 'custom'}
                className={`w-full border rounded-lg px-3 py-2 font-medium transition ${
                  durationPreset !== 'custom'
                    ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Date range helper indicator */}
          <div className="text-[11px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Calculated timeline span:</span>
            <span
              className={`font-semibold font-mono ${
                isDateChronological
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isDateChronological
                ? `${calculatedDays} ${calculatedDays === 1 ? 'day' : 'days'}`
                : 'Invalid (End <= Start)'}
            </span>
          </div>

          {/* Sprint Goal Field (Optional) */}
          <div>
            <label
              htmlFor="sprint-goal-textarea"
              className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Sprint Goal <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="sprint-goal-textarea"
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isSubmitting}
              placeholder="What is the core target or delivery milestone for this sprint? (e.g. Complete Edge D1 migration and RBAC security review)"
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-60 resize-none"
            />
          </div>

          {/* Modal Footer / Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !isDateChronological}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
