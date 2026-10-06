'use client';

import React, { useState } from 'react';
import {
  Paperclip,
  MessageSquare,
  Edit3,
  Plus,
  Check,
  X,
  Trash2,
  Edit2,
  Kanban,
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

  // Inline swimlane editing state
  const [editingLaneId, setEditingLaneId] = useState<string | null>(null);
  const [editingLaneName, setEditingLaneName] = useState('');

  // New swimlane inline input state
  const [isAddingLane, setIsAddingLane] = useState(false);
  const [newLaneName, setNewLaneName] = useState('');

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

  // Safe fallback if project has zero lanes
  const activeLanes = swimlanes.length > 0 ? swimlanes : [
    {
      id: 'default-1',
      projectId: 'default',
      name: 'To Do',
      statusKey: 'To Do',
      color: 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-2',
      projectId: 'default',
      name: 'In Progress',
      statusKey: 'In Progress',
      color: 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-3',
      projectId: 'default',
      name: 'In Review',
      statusKey: 'In Review',
      color: 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/20',
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'default-4',
      projectId: 'default',
      name: 'Done',
      statusKey: 'Done',
      color: 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20',
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
    `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
      active
        ? tone
        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
    }`;

  return (
    <div className="flex flex-col h-full">
    {/* Quick Filter Bar */}
    <div className="flex items-center gap-2 mb-4 flex-wrap">
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
    <div className="flex gap-5 flex-1 min-h-0 items-start overflow-x-auto pb-4">
      {activeLanes.map((lane) => {
        const colIssues = sortedIssues.filter(
          (i) => i.status.toLowerCase() === lane.name.toLowerCase()
        );
        const wipLimit = DEFAULT_WIP_LIMITS[lane.name.toLowerCase()];
        const overWip = wipLimit !== undefined && colIssues.length > wipLimit;
        const colPoints = colIssues.reduce(
          (acc, curr) => acc + (Number(curr.storyPoints) || 0),
          0
        );

        const isEditingThisLane = editingLaneId === lane.id;

        return (
          <div
            key={lane.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, lane.name)}
            className={`flex flex-col w-80 flex-shrink-0 max-h-full rounded-2xl border border-dashed p-3.5 transition-colors ${
              lane.color || 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200 dark:border-slate-800/80">
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
                    className="flex-1 text-xs font-bold px-2 py-1 rounded bg-white dark:bg-slate-800 border border-blue-500 text-slate-900 dark:text-white focus:outline-none"
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
                    className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 min-w-0 group">
                    <span className="font-bold text-sm tracking-wide text-slate-800 dark:text-slate-100 truncate">
                      {lane.name}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                        overWip
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                      title={wipLimit !== undefined ? `WIP limit: ${wipLimit}` : undefined}
                    >
                      {colIssues.length}
                      {wipLimit !== undefined && `/${wipLimit}`}
                    </span>

                    {!isViewer && (
                      <button
                        onClick={() => handleStartEditLane(lane)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition"
                        title="Rename Swimlane"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
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
                    className={`rounded-xl p-3.5 shadow-sm border hover:shadow-md transition-all cursor-pointer group ${
                      issue.isFlagged
                        ? 'bg-amber-500/10 border-amber-500/60 hover:border-amber-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {/* Top Row: Type, Key, Priority & Edit Action */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1 rounded border ${typeCfg.color}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 transition">
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
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
                          title="Edit Task Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-2.5">
                      {issue.title}
                    </h4>

                    {/* Labels */}
                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {issue.labels.slice(0, 3).map((lbl, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer: Attachments, Comments, Story Points, Assignee */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-400">
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
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono px-1.5 py-0.5 rounded font-bold">
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
                <div className="h-28 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add New Swimlane Column Trigger / Inline Form */}
      {!isViewer && (
        <div className="w-80 flex-shrink-0">
          {isAddingLane ? (
            <form
              onSubmit={handleAddLaneSubmit}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                New Swimlane
              </h4>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Staging, QA, Blocked"
                value={newLaneName}
                onChange={(e) => setNewLaneName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingLane(false);
                    setNewLaneName('');
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Add Swimlane
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingLane(true)}
              className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 dark:border-slate-700 dark:hover:border-blue-400 rounded-2xl text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center justify-center gap-2 transition bg-slate-50/50 hover:bg-blue-50/20 dark:bg-slate-900/30"
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
