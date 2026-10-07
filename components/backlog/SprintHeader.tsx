'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Target,
  Pencil,
  MoreHorizontal,
  Plus,
  Flame,
  Clock,
  Play,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Sprint } from '@/lib/types';

interface SprintHeaderProps {
  sprint: Sprint;
  issueCount: number;
  totalPoints: number;
  activeSprintName?: string | null;
  onEditSprint: (sprint: Sprint) => void;
  onStartSprint?: (sprint: Sprint) => void;
  onCompleteSprint?: (sprint: Sprint) => void;
  onDeleteSprint?: (sprintId: string) => void;
  onAddIssue: () => void;
  isViewer: boolean;
  canManageSprint?: boolean;
}

function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return '';
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const [year, month, day] = clean.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimelineRange(startStr?: string | null, endStr?: string | null): string {
  if (!startStr && !endStr) return 'Timeline not set';
  const startFmt = formatDateDisplay(startStr);
  const endFmt = formatDateDisplay(endStr);
  if (startFmt && endFmt) return `${startFmt} – ${endFmt}`;
  if (endFmt) return `Ends ${endFmt}`;
  return `Starts ${startFmt}`;
}

export function SprintHeader({
  sprint,
  issueCount,
  totalPoints,
  activeSprintName,
  onEditSprint,
  onStartSprint,
  onCompleteSprint,
  onDeleteSprint,
  onAddIssue,
  isViewer,
  canManageSprint = true,
}: SprintHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const rawState = (sprint as any).status || sprint.state;
  const isActive = rawState === 'active' || rawState === 'ACTIVE';
  const isPlanned = rawState === 'upcoming' || rawState === 'PLANNED';
  const isClosed = rawState === 'closed' || rawState === 'CLOSED';

  // Single-Active Constraint: Is another sprint currently active?
  const isAnotherSprintActive = Boolean(activeSprintName && !isActive);

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Sprint Title & Badges */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              {isActive && <Flame className="w-4 h-4 text-emerald-500 shrink-0" />}
              {isPlanned && <Clock className="w-4 h-4 text-blue-500 shrink-0" />}
              {isClosed && <Check className="w-4 h-4 text-slate-400 shrink-0" />}
              <span>{sprint.name}</span>
            </h3>

            {/* State badge */}
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            )}
            {isPlanned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Planned
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                Completed
              </span>
            )}

            {/* Issues count badge */}
            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
            </span>

            {/* Points committed badge */}
            <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 px-2 py-0.5 rounded-full">
              {totalPoints} pts {isClosed ? 'burned' : 'committed'}
            </span>
          </div>

          {/* Timeline & Date Range */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatTimelineRange(sprint.startDate, sprint.endDate)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* Active Sprint: "Complete Sprint" Button */}
          {isActive && onCompleteSprint && (
            <button
              type="button"
              onClick={() => onCompleteSprint(sprint)}
              disabled={isViewer || !canManageSprint}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-semibold transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete Sprint</span>
            </button>
          )}

          {/* Planned Sprint: "Start Sprint" Button with single-active constraint */}
          {isPlanned && onStartSprint && (
            <div className="relative group">
              <button
                type="button"
                onClick={() => onStartSprint(sprint)}
                disabled={isViewer || !canManageSprint || isAnotherSprintActive}
                className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md font-semibold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  isAnotherSprintActive
                    ? `Sprint "${activeSprintName}" is currently active. Complete it before starting a new sprint.`
                    : 'Activate this sprint'
                }
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Sprint</span>
              </button>

              {/* Tooltip explaining constraint if disabled */}
              {isAnotherSprintActive && (
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                  <div className="bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    Sprint &quot;{activeSprintName}&quot; is currently active. Complete it first.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit Sprint Button (Available on Active and Planned sprints) */}
          {!isClosed && (
            <button
              type="button"
              onClick={() => onEditSprint(sprint)}
              disabled={isViewer}
              title={isViewer ? 'Viewers cannot edit sprints' : 'Edit Sprint Settings'}
              className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-md font-medium border border-slate-300 dark:border-slate-600 transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Edit</span>
            </button>
          )}

          {/* Add to Sprint Button (Available on Active and Planned sprints) */}
          {!isClosed && (
            <button
              type="button"
              onClick={onAddIssue}
              disabled={isViewer}
              title={isViewer ? 'Viewers cannot add issues' : 'Add issue to sprint'}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Issue</span>
            </button>
          )}

          {/* "..." Context Menu Button & Popover */}
          {!isClosed && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition"
                aria-label="Sprint options menu"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-fade-in">
                  <button
                    type="button"
                    disabled={isViewer}
                    onClick={() => {
                      setMenuOpen(false);
                      onEditSprint(sprint);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/60 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Edit sprint settings</span>
                  </button>

                  {/* Delete Sprint (available on planned sprints) */}
                  {isPlanned && onDeleteSprint && (
                    <button
                      type="button"
                      disabled={isViewer || !canManageSprint}
                      onClick={() => {
                        setMenuOpen(false);
                        if (
                          confirm(
                            `Delete "${sprint.name}"? Any contained issues will be returned to the Product Backlog.`
                          )
                        ) {
                          onDeleteSprint(sprint.id);
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 transition disabled:opacity-50 border-t border-slate-100 dark:border-slate-700/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete sprint</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sprint Goal Banner (if specified) */}
      {sprint.goal && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-850/50 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
          <Target className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-700 dark:text-slate-200 mr-1.5">Goal:</span>
            <span>{sprint.goal}</span>
          </div>
        </div>
      )}
    </div>
  );
}
