'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, X, Loader2, AlertCircle, Inbox, Layers } from 'lucide-react';
import { Sprint, FullIssue } from '@/lib/types';
import { completeSprintAction } from '@/app/actions/sprints';

interface CompleteSprintModalProps {
  sprint: Sprint;
  sprintIssues: FullIssue[];
  plannedSprints: Sprint[];
  isOpen: boolean;
  onClose: () => void;
  onSprintCompleted?: () => void;
}

export function CompleteSprintModal({
  sprint,
  sprintIssues,
  plannedSprints,
  isOpen,
  onClose,
  onSprintCompleted,
}: CompleteSprintModalProps) {
  const completedIssues = sprintIssues.filter(
    (i) => i.status === 'Done' || i.status.toLowerCase().includes('done') || i.status.toLowerCase().includes('shipped')
  );
  const incompleteIssues = sprintIssues.filter(
    (i) => !(i.status === 'Done' || i.status.toLowerCase().includes('done') || i.status.toLowerCase().includes('shipped'))
  );

  const hasIncomplete = incompleteIssues.length > 0;
  const hasPlannedSprints = plannedSprints.length > 0;

  // If no planned sprint exists, auto-select 'backlog'
  const defaultTarget = hasPlannedSprints ? plannedSprints[0].id : 'backlog';
  const [rolloverTarget, setRolloverTarget] = useState<string>(defaultTarget);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await completeSprintAction({
        sprintId: sprint.id,
        rolloverTarget: hasIncomplete ? (rolloverTarget === 'backlog' ? null : rolloverTarget) : null,
      });

      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apextrack:sprint-updated'));
        }
        onSprintCompleted?.();
        onClose();
      } else {
        setErrorMessage(res.error || 'Failed to complete sprint.');
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
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Complete Sprint: {sprint.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review completed work and resolve open issues before closing.
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base">
                {completedIssues.length}
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                  Completed
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Issues finished
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
                {incompleteIssues.length}
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                  Incomplete
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400">
                  Require rollover
                </span>
              </div>
            </div>
          </div>

          {!hasIncomplete ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-bold text-xs">
                All {sprintIssues.length} issues completed!
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                Sprint goals successfully met. Ready to close sprint.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Move {incompleteIssues.length} incomplete issue(s) to:</span>
              </div>

              <div className="space-y-2">
                <select
                  value={rolloverTarget}
                  onChange={(e) => setRolloverTarget(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium"
                >
                  {hasPlannedSprints &&
                    plannedSprints.map((ps) => (
                      <option key={ps.id} value={ps.id}>
                        {ps.name} (Next Planned Sprint)
                      </option>
                    ))}
                  <option value="backlog">Product Backlog (Unscheduled backlog)</option>
                </select>

                {!hasPlannedSprints && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Inbox className="w-3.5 h-3.5 shrink-0" />
                    <span>No planned sprints available. Issues will be moved to the Product Backlog.</span>
                  </p>
                )}
              </div>
            </div>
          )}

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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Closing Sprint...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Sprint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
