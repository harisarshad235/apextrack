'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Paperclip,
  MessageSquare,
  Edit3,
  Plus,
  Check,
  X,
  Trash2,
  Edit2,
  Flag,
  Zap,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullIssue, User, Swimlane, Sprint, isDemoIssue } from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { getActiveSprintAction } from '@/app/actions/sprints';
import { VelocityMetricsWidget } from './VelocityMetricsWidget';

interface KanbanBoardProps {
  issues: FullIssue[];
  users: User[];
  swimlanes: Swimlane[];
  sprints?: Sprint[];
  onSelectIssue: (id: string) => void;
  onStatusChange: (issueId: string, newStatus: string) => void;
  onCreateSwimlane: (name: string, color?: string) => void;
  onUpdateSwimlane: (swimlaneId: string, data: { name?: string; color?: string }) => void;
  onDeleteSwimlane: (swimlaneId: string) => void;
  isViewer: boolean;
  currentUserId?: string;
  onNavigateToBacklog?: () => void;
  onQuickCreateIssue?: (initialStatus?: string) => void;
}

const DEFAULT_WIP_LIMITS: Record<string, number> = {
  'in progress': 5,
  'in review': 4,
};

const getDotColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('to do') || lower.includes('backlog')) return 'bg-cyan-400';
  if (lower.includes('progress') || lower.includes('dev')) return 'bg-amber-400';
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test')) return 'bg-indigo-400';
  if (lower.includes('done') || lower.includes('closed') || lower.includes('complete')) return 'bg-emerald-400';
  return 'bg-cyan-400';
};

const getColBadgeColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('to do') || lower.includes('backlog')) return 'bg-[#171B24] border border-[#232836] text-slate-300';
  if (lower.includes('progress') || lower.includes('dev')) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test')) return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
  if (lower.includes('done') || lower.includes('closed') || lower.includes('complete')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  return 'bg-[#171B24] border border-[#232836] text-slate-300';
};

const getStatusTag = (status: string) => {
  const lower = status.toLowerCase();
  if (lower.includes('to do') || lower.includes('backlog'))
    return { label: 'To Do', dot: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10 border border-cyan-500/20' };
  if (lower.includes('progress') || lower.includes('dev'))
    return { label: 'In Progress', dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/20' };
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test'))
    return { label: 'In Review', dot: 'bg-indigo-400', text: 'text-indigo-400', bg: 'bg-indigo-500/10 border border-indigo-500/20' };
  if (lower.includes('done') || lower.includes('closed') || lower.includes('complete'))
    return { label: 'Done', dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border border-emerald-500/20' };
  return { label: status, dot: 'bg-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10 border border-cyan-500/20' };
};

export function KanbanBoardView({
  issues,
  users,
  swimlanes,
  sprints,
  onSelectIssue,
  onStatusChange,
  onCreateSwimlane,
  onUpdateSwimlane,
  onDeleteSwimlane,
  isViewer,
  currentUserId,
  onNavigateToBacklog,
  onQuickCreateIssue,
}: KanbanBoardProps) {
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverLaneId, setDragOverLaneId] = useState<string | null>(null);
  const [dropErrorToast, setDropErrorToast] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [recentFirst, setRecentFirst] = useState(false);
  const [sprintFilter, setSprintFilter] = useState<string>('ALL');

  // Active sprint state & resolution
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(() => {
    return (
      sprints?.find((s) => ((s as any).status || s.state || '').toUpperCase() === 'ACTIVE') || null
    );
  });
  const [loadingSprint, setLoadingSprint] = useState<boolean>(true);

  // WIP limits local state with localStorage persistence
  const currentProjectId = swimlanes[0]?.projectId || 'default';

  useEffect(() => {
    let isMounted = true;
    async function loadSprint() {
      if (sprints && sprints.length > 0) {
        const found = sprints.find(
          (s) => ((s as any).status || s.state || '').toUpperCase() === 'ACTIVE'
        );
        if (isMounted) {
          setActiveSprint(found || null);
          setLoadingSprint(false);
        }
        return;
      }
      try {
        setLoadingSprint(true);
        const res = await getActiveSprintAction(
          currentProjectId !== 'default' ? currentProjectId : undefined
        );
        if (isMounted) {
          setActiveSprint(res);
          setLoadingSprint(false);
        }
      } catch (err) {
        console.error('Failed to load active sprint:', err);
        if (isMounted) {
          setActiveSprint(null);
          setLoadingSprint(false);
        }
      }
    }

    loadSprint();

    const handleSprintUpdate = () => {
      loadSprint();
    };
    window.addEventListener('kynov:sprint-updated', handleSprintUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('kynov:sprint-updated', handleSprintUpdate);
    };
  }, [currentProjectId, sprints]);

  const handleGoToBacklog = () => {
    if (onNavigateToBacklog) {
      onNavigateToBacklog();
      return;
    }
    const backlogTabBtn = document.querySelector('button[title="Sprint Backlog"]') as HTMLButtonElement | null;
    if (backlogTabBtn) {
      backlogTabBtn.click();
    }
  };

  const [wipLimits, setWipLimits] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved =
          localStorage.getItem(`kynov_wip_limits_${currentProjectId}`) ||
          localStorage.getItem(`apextrack_wip_limits_${currentProjectId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse WIP limits from localStorage', e);
      }
    }
    return DEFAULT_WIP_LIMITS;
  });

  const [editingWipLaneId, setEditingWipLaneId] = useState<string | null>(null);
  const [wipInputVal, setWipInputVal] = useState<string>('');

  const handleSaveWipLimit = (laneName: string) => {
    const parsed = parseInt(wipInputVal.trim(), 10);
    const updated = { ...wipLimits };
    const key = laneName.toLowerCase();
    if (isNaN(parsed) || parsed <= 0) {
      delete updated[key];
    } else {
      updated[key] = parsed;
    }
    setWipLimits(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`kynov_wip_limits_${currentProjectId}`, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save WIP limits to localStorage', e);
      }
    }
    setEditingWipLaneId(null);
  };

  // Inline swimlane editing state
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [editingLaneName, setEditingLaneName] = useState('');

  // New swimlane inline input state
  const [isAddingLane, setIsAddingLane] = useState(false);
  const [newLaneName, setNewLaneName] = useState('');

  // Refs for mobile lane smooth scrolling
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    if (isViewer) return;
    setDraggedIssueId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
  };

  const handleDragOver = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    if (dragOverLaneId !== laneId) {
      setDragOverLaneId(laneId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, laneId: string) => {
    if (dragOverLaneId === laneId) {
      setDragOverLaneId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    setDragOverLaneId(null);
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      const draggedIssue = issues.find((i) => i.key === issueId);
      if (draggedIssue) {
        const isTargetDone = columnStatus.toLowerCase() === 'done';
        if (isTargetDone) {
          const openSubtasks = (draggedIssue.subtasks || []).filter((s) => !s.completed);
          if (openSubtasks.length > 0) {
            setDropErrorToast('Cannot move to Done: all subtasks must be resolved first.');
            setTimeout(() => setDropErrorToast(null), 4000);
            setDraggedIssueId(null);
            return;
          }
          const unresolvedBlockers = (draggedIssue.blockedByIssues || []).filter(
            (b) => b.status.toLowerCase() !== 'done'
          );
          if (unresolvedBlockers.length > 0) {
            setDropErrorToast(
              `Cannot move to Done: issue is blocked by open ticket(s): ${unresolvedBlockers.map((b) => b.key).join(', ')}`
            );
            setTimeout(() => setDropErrorToast(null), 4000);
            setDraggedIssueId(null);
            return;
          }
        }
      }
      onStatusChange(issueId, columnStatus);
    }
    setDraggedIssueId(null);
  };

  const handleStartEditLane = (lane: Swimlane) => {
    if (isViewer) return;
    setEditingLaneId(lane.id);
    setEditingLaneName(lane.name);
  };

  const handleSaveEditLane = (laneId: string) => {
    if (!editingLaneName.trim()) return;
    onUpdateSwimlane(laneId, { name: editingLaneName.trim() });
    setEditingLaneId(null);
  };

  const handleAddLaneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaneName.trim()) return;
    onCreateSwimlane(newLaneName.trim());
    setNewLaneName('');
    setIsAddingLane(false);
  };

  const scrollToLane = (laneId: string) => {
    const el = colRefs.current[laneId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Horizontal scroll tracking and slider control
  const boardScrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollProgress = () => {
    const el = boardScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max > 5) {
      setScrollProgress((el.scrollLeft / max) * 100);
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    const el = boardScrollRef.current;
    if (!el) return;
    updateScrollProgress();
    window.addEventListener('resize', updateScrollProgress);
    return () => window.removeEventListener('resize', updateScrollProgress);
  }, [swimlanes.length, issues.length]);

  const handleSliderChange = (val: number) => {
    const el = boardScrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (val / 100) * max;
    setScrollProgress(val);
  };

  const scrollByDelta = (delta: number) => {
    const el = boardScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // Safe fallback if project has zero lanes
  const activeLanes = swimlanes.length > 0 ? swimlanes : [
    {
      id: 'default-1',
      projectId: 'default',
      name: 'To Do',
      statusKey: 'To Do',
      color: 'border-[#232836] bg-[#11141B]',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-2',
      projectId: 'default',
      name: 'In Progress',
      statusKey: 'In Progress',
      color: 'border-[#232836] bg-[#11141B]',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-3',
      projectId: 'default',
      name: 'In Review',
      statusKey: 'In Review',
      color: 'border-[#232836] bg-[#11141B]',
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-4',
      projectId: 'default',
      name: 'Done',
      statusKey: 'Done',
      color: 'border-[#232836] bg-[#11141B]',
      sortOrder: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const lastActivity = (i: FullIssue) =>
    Math.max(
      new Date(i.history?.[0]?.createdAt ?? 0).getTime(),
      ...(i.history || []).map((h) => new Date(h.createdAt).getTime()),
      new Date(i.updatedAt).getTime()
    );

  const isLaneMatch = (issueStatus: string, lane: Swimlane) => {
    const stat = (issueStatus || '').toLowerCase().trim();
    const laneName = lane.name.toLowerCase().trim();
    const laneKey = (lane.statusKey || '').toLowerCase().trim();
    if (stat === laneName) return true;
    if (laneKey && stat === laneKey) return true;
    if ((laneName === 'to do' || laneKey === 'todo') && (stat === 'to do' || stat === 'todo' || stat === 'backlog')) return true;
    if ((laneName.includes('progress') || laneKey === 'in_progress') && (stat.includes('progress') || stat === 'in_progress' || stat === 'inprogress')) return true;
    if ((laneName.includes('review') || laneKey === 'in_review') && (stat.includes('review') || stat === 'in_review')) return true;
    if ((laneName === 'done' || laneKey === 'done') && (stat === 'done' || stat === 'completed' || stat === 'closed')) return true;
    if ((laneName.includes('qa') || laneKey === 'qa') && (stat.includes('qa') || stat === 'in qa')) return true;
    return false;
  };

  const sprintFilteredIssues = useMemo<FullIssue[]>(() => {
    if (sprintFilter === 'ALL') return issues;
    if (sprintFilter === 'ACTIVE') {
      return activeSprint
        ? issues.filter(
            (i) => i.sprintId === activeSprint.id || (i as any).sprint_id === activeSprint.id
          )
        : issues;
    }
    if (sprintFilter === 'BACKLOG') {
      return issues.filter((i) => !i.sprintId && !(i as any).sprint_id);
    }
    return issues.filter(
      (i) => i.sprintId === sprintFilter || (i as any).sprint_id === sprintFilter
    );
  }, [issues, sprintFilter, activeSprint]);

  const activeSprintIssues = issues.filter(
    (i) =>
      activeSprint &&
      (i.sprintId === activeSprint.id || (i as any).sprint_id === activeSprint.id)
  );

  const metricIssues =
    sprintFilter === 'ACTIVE' && activeSprint ? activeSprintIssues : sprintFilteredIssues;

  const totalSprintPoints = metricIssues.reduce(
    (acc, curr) => acc + (Number(curr.storyPoints) || 0),
    0
  );
  const completedSprintPoints = metricIssues
    .filter((i) => (i.status || '').toLowerCase() === 'done')
    .reduce((acc, curr) => acc + (Number(curr.storyPoints) || 0), 0);
  const sprintCompletionRate =
    totalSprintPoints > 0 ? Math.round((completedSprintPoints / totalSprintPoints) * 100) : 0;

  const visibleIssues = sprintFilteredIssues
    .filter((i) => !onlyMine || (!!currentUserId && i.assigneeId === currentUserId))
    .filter((i) => !onlyFlagged || i.isFlagged === true);
  const sortedIssues = recentFirst
    ? [...visibleIssues].sort((a, b) => lastActivity(b) - lastActivity(a))
    : visibleIssues;

  const pillClass = (active: boolean, tone: string) =>
    `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-150 flex-shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs ${
      active
        ? tone
        : 'bg-white dark:bg-[#11141B] border-slate-200 dark:border-[#232836] text-slate-600 dark:text-slate-300 hover:border-[#343C50]'
    }`;

  return (
    <div className="flex flex-col h-full space-y-3">
      {dropErrorToast && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{dropErrorToast}</span>
          </div>
          <button onClick={() => setDropErrorToast(null)} className="text-slate-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Board Header Bar: Sprint Info & Velocity Sparklines Widget */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap w-full sm:w-auto">
          {/* Interactive Sprint Filter Selector */}
          <div className="relative flex items-center">
            <select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-3 pr-8 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-semibold flex-shrink-0 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-cyan-500/40 hover:bg-cyan-500/15 transition"
              title="Filter Kanban board by Sprint"
            >
              <option value="ALL" className="bg-white dark:bg-[#11141B] text-slate-800 dark:text-slate-200">
                All Board Issues ({issues.length})
              </option>
              {activeSprint && (
                <option value="ACTIVE" className="bg-white dark:bg-[#11141B] text-slate-800 dark:text-slate-200">
                  ⚡ {activeSprint.name} (Active)
                </option>
              )}
              {sprints &&
                sprints.length > 0 &&
                sprints
                  .filter((s) => s.id !== activeSprint?.id)
                  .map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                      className="bg-white dark:bg-[#11141B] text-slate-800 dark:text-slate-200"
                    >
                      {s.name} ({((s as any).status || s.state || 'PLANNED').toUpperCase()})
                    </option>
                  ))}
              <option value="BACKLOG" className="bg-white dark:bg-[#11141B] text-slate-800 dark:text-slate-200">
                Backlog Issues
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setOnlyMine((v) => !v)}
            className={pillClass(onlyMine, 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/25')}
          >
            <Zap className="w-3.5 h-3.5" /> My Issues
          </button>
          <button
            onClick={() => setOnlyFlagged((v) => !v)}
            className={pillClass(onlyFlagged, 'bg-amber-500 border-amber-500 text-white shadow-amber-500/25')}
          >
            <Flag className="w-3.5 h-3.5" /> Flagged
          </button>
          <button
            onClick={() => setRecentFirst((v) => !v)}
            className={pillClass(recentFirst, 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/25')}
          >
            <Clock className="w-3.5 h-3.5" /> Recent
          </button>
        </div>

        {/* Inline Velocity Mini-Sparklines Widget */}
        {(activeSprint || totalSprintPoints > 0) && (
          <VelocityMetricsWidget
            completedPoints={completedSprintPoints}
            totalPoints={totalSprintPoints}
            completionRate={sprintCompletionRate}
            sprintName={activeSprint ? activeSprint.name : 'Board Overview'}
            daysRemaining={6}
          />
        )}
      </div>

      {loadingSprint ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[350px]">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading active sprint metrics...</span>
          </div>
        </div>
      ) : !activeSprint && sprintFilter === 'ACTIVE' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[420px] rounded-2xl border border-dashed border-slate-300 dark:border-[#232836] bg-slate-50/50 dark:bg-[#11141B]/40 my-4">
          <div className="max-w-md w-full p-8 rounded-2xl border border-slate-200 dark:border-[#232836] bg-white dark:bg-[#11141B] shadow-2xl flex flex-col items-center text-center transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 ring-8 ring-cyan-500/5">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              No Active Sprint in Progress
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-sm">
              The Kanban Board displays active sprint workflow tasks. Start a planned sprint from your backlog to track velocity and card flow here.
            </p>
            <button
              onClick={handleGoToBacklog}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
            >
              Go to Backlog &amp; Start Sprint →
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Sticky Lane Navigation Pills (< md screens) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none sticky top-0 z-10 bg-slate-50 dark:bg-[#0A0C10] py-1 border-b border-slate-200 dark:border-[#232836]">
            {activeLanes.map((lane) => {
              const count = sortedIssues.filter((i) => isLaneMatch(i.status, lane)).length;
              return (
                <button
                  key={lane.id}
                  onClick={() => scrollToLane(lane.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] text-slate-700 dark:text-slate-300 flex-shrink-0 active:scale-95 transition"
                >
                  <span>{lane.name}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kanban Columns Snap Container */}
          <div
            ref={boardScrollRef}
            onScroll={updateScrollProgress}
            className="flex gap-4 flex-1 min-h-0 items-start overflow-x-auto pb-4 board-scrollbar snap-x snap-mandatory md:snap-none"
          >
            {activeLanes.map((lane) => {
              const colIssues = sortedIssues.filter((i) => isLaneMatch(i.status, lane));
              const wipLimit = wipLimits[lane.name.toLowerCase()];
              const overWip = wipLimit !== undefined && wipLimit > 0 && colIssues.length > wipLimit;
              const colPoints = colIssues.reduce(
                (acc, curr) => acc + (Number(curr.storyPoints) || 0),
                0
              );
              const isEditingThisLane = editingLaneId === lane.id;
              const isDragOver = dragOverLaneId === lane.id;

              return (
                <div
                  key={lane.id}
                  ref={(el) => {
                    colRefs.current[lane.id] = el;
                  }}
                  onDragOver={(e) => handleDragOver(e, lane.id)}
                  onDragLeave={(e) => handleDragLeave(e, lane.id)}
                  onDrop={(e) => handleDrop(e, lane.name)}
                  className={`flex flex-col w-[86vw] sm:w-[320px] md:w-80 flex-shrink-0 snap-center md:snap-align-none max-h-full rounded-2xl border p-3.5 shadow-sm transition-all duration-200 ${
                    isDragOver
                      ? 'drop-zone-pulse border-cyan-500/80 bg-cyan-500/5'
                      : 'border-slate-200/80 dark:border-[#232836] bg-slate-100/70 dark:bg-[#11141B]/90 backdrop-blur-sm'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/80 dark:border-[#232836]">
                    {isEditingThisLane ? (
                      <div className="flex items-center gap-1.5 w-full">
                        <input
                          type="text"
                          autoFocus
                          value={editingLaneName}
                          onChange={(e) => setEditingLaneName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEditLane(lane.id);
                            if (e.key === 'Escape') setEditingLaneId(null);
                          }}
                          className="flex-1 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-[#171B24] border border-cyan-500 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEditLane(lane.id)}
                          className="p-1 rounded bg-cyan-600 text-white hover:bg-cyan-700"
                          title="Save Column Name"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingLaneId(null)}
                          className="p-1 rounded bg-slate-200 dark:bg-[#232836] text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0 group">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 tracking-tight truncate">
                            {lane.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${getColBadgeColor(
                              lane.name
                            )}`}
                          >
                            {colIssues.length}
                          </span>

                          {/* Interactive WIP Limit Pill */}
                          <div className="relative flex items-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (isViewer) return;
                                setEditingWipLaneId(editingWipLaneId === lane.id ? null : lane.id);
                                setWipInputVal(
                                  wipLimit !== undefined && wipLimit > 0 ? String(wipLimit) : ''
                                );
                              }}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold flex-shrink-0 flex items-center gap-1 transition shadow-xs cursor-pointer ${
                                overWip
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/50 animate-pulse'
                                  : wipLimit && wipLimit > 0
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-[#1E2330] dark:hover:bg-[#272F42] dark:text-slate-100 border border-slate-300 dark:border-[#2E3648]'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141822] dark:hover:bg-[#1C2230] dark:text-slate-300 border border-dashed border-slate-300 dark:border-[#283040]'
                              }`}
                              title={
                                isViewer
                                  ? undefined
                                  : `Set WIP Limit (Current: ${wipLimit && wipLimit > 0 ? `Max ${wipLimit}` : 'Unlimited'})`
                              }
                            >
                              <span>{wipLimit && wipLimit > 0 ? `Max ${wipLimit}` : 'WIP: ∞'}</span>
                              {!isViewer && (
                                <Edit2 className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>

                            {/* Floating Popover Tooltip for Setting WIP Limit */}
                            {editingWipLaneId === lane.id && (
                              <div className="absolute top-full left-0 mt-1.5 z-40 bg-white dark:bg-[#171B24] border border-slate-300 dark:border-[#232836] rounded-xl p-2.5 shadow-2xl flex flex-col gap-2 min-w-[170px] animate-in fade-in zoom-in-95 duration-100">
                                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                                  <span>Set WIP Limit</span>
                                  <button
                                    type="button"
                                    onClick={() => setEditingWipLaneId(null)}
                                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-0.5 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={99}
                                    placeholder="0"
                                    value={wipInputVal}
                                    onChange={(e) => setWipInputVal(e.target.value)}
                                    className="w-16 text-xs font-mono font-bold bg-white dark:bg-[#0A0C10] text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-[#232836] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveWipLimit(lane.name);
                                      if (e.key === 'Escape') setEditingWipLaneId(null);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveWipLimit(lane.name)}
                                    className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Save</span>
                                  </button>
                                </div>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                                  0 = unlimited
                                </span>
                              </div>
                            )}
                          </div>

                          {!isViewer && (
                            <button
                              onClick={() => handleStartEditLane(lane)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-400 rounded transition"
                              title="Rename Column"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Velocity Points Badge & Quick Add Task Trigger */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[11px] font-mono text-slate-400 font-medium px-1.5 py-0.5 rounded bg-black/5 dark:bg-[#171B24] border border-transparent dark:border-[#232836]">
                            {colPoints} pts
                          </span>

                          {!isViewer && (
                            <button
                              onClick={() => {
                                if (onQuickCreateIssue) {
                                  onQuickCreateIssue(lane.name);
                                }
                              }}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#171B24] text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                              title={`Quick Add Task in ${lane.name}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {!isViewer && activeLanes.length > 1 && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete swimlane "${lane.name}"? Tasks inside will be re-assigned.`
                                  )
                                ) {
                                  onDeleteSwimlane(lane.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                              title="Delete Swimlane"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Droppable Card List with Fluid Motion & Drop Zone affordance */}
                  <div className="flex-1 overflow-y-auto space-y-3 pt-3 min-h-[350px] scrollbar-none">
                    {colIssues.map((issue) => {
                      const typeCfg = getTypeConfig(issue.type);
                      const priorityCfg = getPriorityConfig(issue.priority);
                      const assignee = issue.assignee;
                      const TypeIcon = typeCfg.icon;
                      const totalSubtasks = issue.subtasks?.length || 0;
                      const completedSubtasks =
                        issue.subtasks?.filter((s) => s.completed).length || 0;

                      return (
                        <motion.div
                          key={issue.key}
                          layout
                          whileHover={{ y: -3, scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          draggable={!isViewer}
                          onDragStart={(e) => handleDragStart(e as any, issue.key)}
                          onClick={() => onSelectIssue(issue.key)}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onSelectIssue(issue.key);
                            }
                          }}
                          className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer group shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                            issue.isFlagged
                              ? 'bg-amber-500/10 border border-amber-500/60 hover:border-amber-400'
                              : 'bg-white dark:bg-[#11141B] border border-slate-200/80 dark:border-[#232836] hover:border-[#343C50] hover:shadow-lg dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                          }`}
                        >
                          {/* Top Row: Type Pill, Key & Status */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeCfg.color}`}
                              >
                                <TypeIcon className="w-3 h-3" />
                                <span>{issue.type}</span>
                              </span>

                              <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                                {issue.key}
                              </span>

                              {/* Classification: Live vs Demo */}
                              {isDemoIssue(issue) ? (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-mono"
                                  title="Demo / Showcase Issue"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                  Demo
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-mono"
                                  title="Production / Live Issue"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Live
                                </span>
                              )}

                              {issue.isFlagged && (
                                <span
                                  className="p-0.5 rounded bg-amber-500 text-white"
                                  title="Flagged impediment"
                                >
                                  <Flag className="w-3 h-3" />
                                </span>
                              )}

                              {issue.blockedByIssues &&
                                issue.blockedByIssues.some(
                                  (b) => b.status.toLowerCase() !== 'done'
                                ) && (
                                  <span
                                    className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                    title="Blocked by unresolved dependencies"
                                  >
                                    Blocked
                                  </span>
                                )}
                            </div>

                            {/* Priority Icon Pill */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${priorityCfg.color}`}
                              title={`Priority: ${issue.priority}`}
                            >
                              {priorityCfg.icon}
                            </span>
                          </div>

                          {/* Parent Epic Tag */}
                          {issue.parent && (
                            <div className="mb-1.5">
                              <span
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight bg-purple-500/10 text-purple-400 border border-purple-500/25"
                              >
                                {issue.parent.key}: {issue.parent.title}
                              </span>
                            </div>
                          )}

                          {/* High-Contrast Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-cyan-400 transition-colors">
                            {issue.title}
                          </h4>

                          {/* Description Snippet */}
                          {issue.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                              {issue.description.replace(/[#*`_\[\]()]/g, '')}
                            </p>
                          )}

                          {/* Labels Multi-Tag Pills */}
                          {issue.labels && issue.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2.5">
                              {issue.labels.slice(0, 3).map((lbl, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 dark:bg-[#171B24] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#232836] px-1.5 py-0.5 rounded-md font-mono"
                                >
                                  #{lbl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Subtask Progress Bar (if any) */}
                          {totalSubtasks > 0 && (
                            <div className="mb-3 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                                  Subtasks
                                </span>
                                <span>
                                  {completedSubtasks}/{totalSubtasks}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-[#171B24] rounded-full h-1 overflow-hidden">
                                <div
                                  className="bg-cyan-400 h-1 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${(completedSubtasks / totalSubtasks) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer: Due Date, Story Points, Comments & Assignee with Active Status Dot */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-[#232836] text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              {issue.storyPoints && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#171B24] border border-slate-200 dark:border-[#232836] text-cyan-400">
                                  {issue.storyPoints} pts
                                </span>
                              )}
                              {issue.comments?.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <MessageSquare className="w-3 h-3" />
                                  {issue.comments.length}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Assignee Avatar with active presence dot */}
                              <div className="relative inline-block">
                                <UserAvatar
                                  user={assignee}
                                  size="xs"
                                  title={assignee ? `Assignee: ${assignee.name}` : 'Unassigned'}
                                />
                                {assignee && (
                                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#11141B]" />
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {colIssues.length === 0 && (
                      <div className="h-28 border border-dashed border-slate-300 dark:border-[#232836] rounded-2xl flex flex-col items-center justify-center gap-1 text-xs text-slate-500">
                        <span>Drop tasks here</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add New Swimlane Column Trigger / Inline Form */}
            {!isViewer && (
              <div className="w-[86vw] sm:w-[320px] md:w-80 flex-shrink-0 snap-center md:snap-align-none">
                {isAddingLane ? (
                  <form
                    onSubmit={handleAddLaneSubmit}
                    className="p-4 rounded-2xl bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] shadow-xl space-y-3"
                  >
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      New Column
                    </h4>
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. Staging, QA, Blocked"
                      value={newLaneName}
                      onChange={(e) => setNewLaneName(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-[#171B24] border border-slate-300 dark:border-[#232836] rounded-xl p-2.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingLane(false);
                          setNewLaneName('');
                        }}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:bg-[#171B24] rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg shadow-sm cursor-pointer"
                      >
                        Add Column
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingLane(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-cyan-500 dark:border-[#232836] dark:hover:border-cyan-400 rounded-2xl text-xs font-semibold text-slate-500 hover:text-cyan-400 dark:text-slate-400 dark:hover:text-cyan-400 flex items-center justify-center gap-2 transition bg-slate-50/50 hover:bg-cyan-500/5 dark:bg-[#11141B]/40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Column
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Bottom Horizontal Slider Navigation Strip */}
          <div className="flex-shrink-0 pt-2 pb-1 border-t border-slate-200 dark:border-[#232836] flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
            {/* Quick Jump Column Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mr-1 hidden sm:inline">
                Columns:
              </span>
              {activeLanes.map((lane) => (
                <button
                  key={lane.id}
                  onClick={() => scrollToLane(lane.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-[#171B24] cursor-pointer"
                  title={`Jump to ${lane.name}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(lane.name)}`} />
                  <span className="truncate max-w-[100px]">{lane.name}</span>
                </button>
              ))}
            </div>

            {/* Horizontal Scroll Slider & Arrow Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[260px] max-w-sm">
              <button
                onClick={() => scrollByDelta(-320)}
                className="p-1 rounded-lg bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] hover:bg-slate-100 dark:hover:bg-[#171B24] text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scrollProgress}
                  onChange={(e) => handleSliderChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-[#171B24] rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition"
                  title="Drag horizontal slider across columns"
                />
              </div>

              <button
                onClick={() => scrollByDelta(320)}
                className="p-1 rounded-lg bg-white dark:bg-[#11141B] border border-slate-200 dark:border-[#232836] hover:bg-slate-100 dark:hover:bg-[#171B24] text-slate-400 hover:text-white transition active:scale-95 cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default KanbanBoardView;
