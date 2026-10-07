'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { FullIssue, User, Swimlane } from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface KanbanBoardProps {
  issues: FullIssue[];
  users: User[];
  swimlanes: Swimlane[];
  onSelectIssue: (id: string) => void;
  onStatusChange: (issueId: string, newStatus: string) => void;
  onCreateSwimlane: (name: string, color?: string) => void;
  onUpdateSwimlane: (swimlaneId: string, data: { name?: string; color?: string }) => void;
  onDeleteSwimlane: (swimlaneId: string) => void;
  isViewer: boolean;
  currentUserId?: string;
}

const DEFAULT_WIP_LIMITS: Record<string, number> = {
  'in progress': 5,
  'in review': 4,
};

const getDotColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('to do') || lower.includes('backlog')) return 'bg-zinc-400';
  if (lower.includes('progress') || lower.includes('dev')) return 'bg-blue-500';
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test')) return 'bg-amber-500';
  if (lower.includes('done') || lower.includes('closed') || lower.includes('complete')) return 'bg-emerald-500';
  return 'bg-blue-400';
};

export function KanbanBoardView({
  issues,
  users,
  swimlanes,
  onSelectIssue,
  onStatusChange,
  onCreateSwimlane,
  onUpdateSwimlane,
  onDeleteSwimlane,
  isViewer,
  currentUserId,
}: KanbanBoardProps) {
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [recentFirst, setRecentFirst] = useState(false);

  // WIP limits local state with localStorage persistence
  const currentProjectId = swimlanes[0]?.projectId || 'default';
  const [wipLimits, setWipLimits] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`apextrack_wip_limits_${currentProjectId}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse WIP limits from localStorage', e);
      }
    }
    return DEFAULT_WIP_LIMITS;
  });

  // Re-sync WIP limits whenever active project changes
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProjectId) {
      try {
        const saved = localStorage.getItem(`apextrack_wip_limits_${currentProjectId}`);
        if (saved) {
          setWipLimits(JSON.parse(saved));
          return;
        }
      } catch (e) {
        console.error('Failed to parse WIP limits from localStorage', e);
      }
      setWipLimits(DEFAULT_WIP_LIMITS);
    }
  }, [currentProjectId]);

  const [editingWipLaneId, setEditingWipLaneId] = useState<string | null>(null);
  const [wipInputVal, setWipInputVal] = useState<string>('');

  const handleSaveWipLimit = (laneName: string) => {
    const key = laneName.toLowerCase();
    const parsed = parseInt(wipInputVal, 10);
    const newLimit = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    const updated = { ...wipLimits, [key]: newLimit };
    setWipLimits(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`apextrack_wip_limits_${currentProjectId}`, JSON.stringify(updated));
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
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

  // Safe fallback if project has zero lanes
  const activeLanes = swimlanes.length > 0 ? swimlanes : [
    {
      id: 'default-1',
      projectId: 'default',
      name: 'To Do',
      statusKey: 'To Do',
      color: 'border-black/[0.06] dark:border-white/[0.07] bg-slate-100/70 dark:bg-[#111114]',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-2',
      projectId: 'default',
      name: 'In Progress',
      statusKey: 'In Progress',
      color: 'border-black/[0.06] dark:border-white/[0.07] bg-slate-100/70 dark:bg-[#111114]',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-3',
      projectId: 'default',
      name: 'In Review',
      statusKey: 'In Review',
      color: 'border-black/[0.06] dark:border-white/[0.07] bg-slate-100/70 dark:bg-[#111114]',
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-4',
      projectId: 'default',
      name: 'Done',
      statusKey: 'Done',
      color: 'border-black/[0.06] dark:border-white/[0.07] bg-slate-100/70 dark:bg-[#111114]',
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

  const visibleIssues = issues
    .filter((i) => !onlyMine || (!!currentUserId && i.assigneeId === currentUserId))
    .filter((i) => !onlyFlagged || i.isFlagged === true);
  const sortedIssues = recentFirst
    ? [...visibleIssues].sort((a, b) => lastActivity(b) - lastActivity(a))
    : visibleIssues;

  const pillClass = (active: boolean, tone: string) =>
    `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition flex-shrink-0 ${
      active
        ? tone
        : 'bg-white dark:bg-[#121215] border-black/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-zinc-400 hover:border-blue-400/50 hover:text-slate-900 dark:hover:text-zinc-100'
    }`;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Quick Filter Bar (Single Horizontal Scrolling Row) */}
      <div className="flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap w-full">
          <button
            onClick={() => setOnlyMine((v) => !v)}
            className={pillClass(onlyMine, 'bg-blue-600 border-blue-600 text-white')}
          >
            <Zap className="w-3.5 h-3.5" /> Only My Issues
          </button>
          <button
            onClick={() => setOnlyFlagged((v) => !v)}
            className={pillClass(onlyFlagged, 'bg-amber-500 border-amber-500 text-white')}
          >
            <Flag className="w-3.5 h-3.5" /> Flagged Blockers
          </button>
          <button
            onClick={() => setRecentFirst((v) => !v)}
            className={pillClass(recentFirst, 'bg-emerald-600 border-emerald-600 text-white')}
          >
            <Clock className="w-3.5 h-3.5" /> Recently Updated
          </button>
        </div>
      </div>

      {/* Mobile Sticky Lane Navigation Pills (< md screens) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none sticky top-0 z-10 bg-[#f8fafc] dark:bg-[#09090b] py-1 border-b border-black/[0.06] dark:border-white/[0.08]">
        {activeLanes.map((lane) => {
          const count = sortedIssues.filter(
            (i) => i.status.toLowerCase() === lane.name.toLowerCase()
          ).length;
          return (
            <button
              key={lane.id}
              onClick={() => scrollToLane(lane.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#121215] border border-black/[0.06] dark:border-white/[0.08] text-slate-700 dark:text-zinc-300 flex-shrink-0 active:scale-95 transition"
            >
              <span>{lane.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-slate-500 dark:text-zinc-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Columns Snap-Carousel Container */}
      <div className="flex gap-4 flex-1 min-h-0 items-start overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory md:snap-none">
        {activeLanes.map((lane) => {
          const colIssues = sortedIssues.filter(
            (i) => i.status.toLowerCase() === lane.name.toLowerCase()
          );
          const wipLimit = wipLimits[lane.name.toLowerCase()];
          const overWip = wipLimit !== undefined && wipLimit > 0 && colIssues.length > wipLimit;
          const colPoints = colIssues.reduce(
            (acc, curr) => acc + (Number(curr.storyPoints) || 0),
            0
          );

          const isEditingThisLane = editingLaneId === lane.id;

          return (
            <div
              key={lane.id}
              ref={(el) => {
                colRefs.current[lane.id] = el;
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, lane.name)}
              className="flex flex-col w-[86vw] sm:w-[320px] md:w-80 flex-shrink-0 snap-center md:snap-align-none max-h-full rounded-xl border border-black/[0.06] dark:border-white/[0.07] bg-slate-100/70 dark:bg-[#111114] p-3.5 transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-black/[0.06] dark:border-white/[0.08]">
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
                      className="flex-1 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-[#16161a] border border-blue-500 text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEditLane(lane.id)}
                      className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      title="Save Swimlane Name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingLaneId(null)}
                      className="p-1 rounded bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-300"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 min-w-0 group">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getDotColor(lane.name)}`} />
                      <span className="font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-zinc-400 truncate">
                        {lane.name}
                      </span>

                      {/* Interactive WIP Limit Pill & Compact Popover */}
                      <div className="relative flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (isViewer) return;
                            setEditingWipLaneId(editingWipLaneId === lane.id ? null : lane.id);
                            setWipInputVal(wipLimit !== undefined && wipLimit > 0 ? String(wipLimit) : '');
                          }}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold flex-shrink-0 flex items-center gap-1 transition cursor-pointer ${
                            overWip
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                              : 'bg-black/5 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-zinc-200'
                          }`}
                          title={isViewer ? undefined : `Set WIP Limit (Current: ${wipLimit || 'Unlimited'})`}
                        >
                          <span>
                            {colIssues.length}
                            {wipLimit && wipLimit > 0 ? `/${wipLimit}` : ''}
                          </span>
                          {!isViewer && (
                            <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover:opacity-90 transition-opacity" />
                          )}
                        </button>

                        {/* Floating Popover Tooltip for Setting WIP Limit */}
                        {editingWipLaneId === lane.id && (
                          <div className="absolute top-full left-0 mt-1.5 z-40 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 rounded-xl p-2.5 shadow-xl flex flex-col gap-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-100">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                              <span>Set WIP Limit</span>
                              <button
                                type="button"
                                onClick={() => setEditingWipLaneId(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 rounded"
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
                                className="w-14 text-xs font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-300 dark:border-zinc-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveWipLimit(lane.name);
                                  if (e.key === 'Escape') setEditingWipLaneId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveWipLimit(lane.name)}
                                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
                                title="Save WIP Limit"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-mono">
                              0 = unlimited
                            </span>
                          </div>
                        )}
                      </div>

                      {!isViewer && (
                        <button
                          onClick={() => handleStartEditLane(lane)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="Rename Swimlane"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500 font-medium">
                        {colPoints} pts
                      </span>
                      {!isViewer && activeLanes.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete swimlane "${lane.name}"? Any tasks inside will be moved to another lane.`)) {
                              onDeleteSwimlane(lane.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                          title="Delete Swimlane"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Droppable Card List */}
              <div className="flex-1 overflow-y-auto space-y-3 pt-3 min-h-[350px]">
                {colIssues.map((issue) => {
                  const typeCfg = getTypeConfig(issue.type);
                  const priorityCfg = getPriorityConfig(issue.priority);
                  const assignee = issue.assignee;
                  const TypeIcon = typeCfg.icon;

                  return (
                    <div
                      key={issue.key}
                      draggable={!isViewer}
                      onDragStart={(e) => handleDragStart(e, issue.key)}
                      onClick={() => onSelectIssue(issue.key)}
                      className={`rounded-xl p-3.5 transition-all duration-150 cursor-pointer group shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] ${
                        issue.isFlagged
                          ? 'bg-amber-500/10 border border-amber-500/60 hover:border-amber-500'
                          : 'bg-white dark:bg-[#16161a] border border-black/[0.06] dark:border-white/[0.07] hover:border-black/20 dark:hover:border-white/20'
                      }`}
                    >
                      {/* Top Row: Type, Key, Priority & Edit Action */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1 rounded border ${typeCfg.color}`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-zinc-400 tracking-tight group-hover:text-blue-500 transition">
                            {issue.key}
                          </span>
                          {issue.isFlagged && (
                            <span
                              className="p-0.5 rounded bg-amber-500 text-white"
                              title="Flagged impediment"
                            >
                              <Flag className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${priorityCfg.color}`}
                          >
                            {priorityCfg.icon} {issue.priority}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectIssue(issue.key);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition"
                            title="Edit Task Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-zinc-100 line-clamp-2 leading-snug mb-2.5">
                        {issue.title}
                      </h4>

                      {/* Labels */}
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {issue.labels.slice(0, 3).map((lbl, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-1.5 py-0.5 rounded"
                            >
                              {lbl}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Attachments, Comments, Story Points, Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-slate-400 dark:text-zinc-400">
                        <div className="flex items-center gap-3">
                          {issue.attachments?.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Paperclip className="w-3 h-3" />
                              {issue.attachments.length}
                            </span>
                          )}
                          {issue.comments?.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <MessageSquare className="w-3 h-3" />
                              {issue.comments.length}
                            </span>
                          )}
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono px-1.5 py-0.5 rounded font-bold">
                            {issue.storyPoints || 0} pts
                          </span>
                        </div>

                        <UserAvatar
                          user={assignee}
                          size="xs"
                          title={assignee ? `Assignee: ${assignee.name}` : 'Unassigned'}
                        />
                      </div>
                    </div>
                  );
                })}

                {colIssues.length === 0 && (
                  <div className="h-28 border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-xl flex items-center justify-center text-xs text-slate-400 dark:text-zinc-500">
                    Drop tasks here
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
                className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-black/[0.06] dark:border-white/[0.08] shadow-md space-y-3"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-mono">
                  New Swimlane
                </h4>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Staging, QA, Blocked"
                  value={newLaneName}
                  onChange={(e) => setNewLaneName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-zinc-900 border border-black/[0.06] dark:border-white/[0.08] rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingLane(false);
                      setNewLaneName('');
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
                  >
                    Add Swimlane
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingLane(true)}
                className="w-full py-4 border-2 border-dashed border-black/[0.08] hover:border-blue-500 dark:border-white/[0.08] dark:hover:border-blue-400 rounded-2xl text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition bg-slate-50/50 hover:bg-blue-50/20 dark:bg-zinc-900/30"
              >
                <Plus className="w-4 h-4" /> Add Swimlane
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

