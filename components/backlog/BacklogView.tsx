'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Plus,
  Inbox,
  Layers,
  ChevronDown,
  ChevronRight,
  Archive,
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { FullIssue, User, Swimlane, Sprint } from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SprintHeader } from '@/components/backlog/SprintHeader';
import { EditSprintModal } from '@/components/sprints/EditSprintModal';
import { StartSprintModal } from '@/components/sprints/StartSprintModal';
import { CompleteSprintModal } from '@/components/sprints/CompleteSprintModal';
import {
  createSprintAction,
  deleteSprintAction,
  moveIssueSprintAction,
} from '@/app/actions/sprints';

interface BacklogViewProps {
  issues: FullIssue[];
  users: User[];
  sprints?: Sprint[];
  swimlanes?: Swimlane[];
  onSelectIssue: (id: string) => void;
  onStatusChange: (issueId: string, newStatus: string) => void;
  onCreateIssue: () => void;
  onUpdateSprint?: (sprint: Sprint) => void;
  isViewer: boolean;
}

const DEFAULT_SPRINTS: Sprint[] = [
  {
    id: 's24',
    name: 'Sprint 24',
    state: 'active',
    goal: 'Edge data layer + RBAC',
    startDate: '2026-10-01',
    endDate: '2026-10-15',
    createdAt: new Date(),
  },
  {
    id: 's25',
    name: 'Sprint 25',
    state: 'upcoming',
    goal: 'Identity hardening',
    startDate: '2026-10-16',
    endDate: '2026-10-30',
    createdAt: new Date(),
  },
];

function formatDateDisplay(dateStr?: string | null | number | Date): string {
  if (!dateStr) return '';
  if (typeof dateStr === 'number') {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  const clean = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
  const [year, month, day] = clean.split('-').map(Number);
  if (!year || !month || !day) return String(dateStr);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BacklogView({
  issues: initialIssues,
  sprints,
  swimlanes = [],
  onSelectIssue,
  onStatusChange,
  onCreateIssue,
  onUpdateSprint,
  isViewer,
}: BacklogViewProps) {
  const [localIssues, setLocalIssues] = useState<FullIssue[]>(initialIssues);
  const [localSprints, setLocalSprints] = useState<Sprint[]>(
    sprints && sprints.length > 0 ? sprints : DEFAULT_SPRINTS
  );

  // Sync if parent props change
  React.useEffect(() => {
    setLocalIssues(initialIssues);
  }, [initialIssues]);

  React.useEffect(() => {
    if (sprints && sprints.length > 0) {
      setLocalSprints(sprints);
    }
  }, [sprints]);

  // Dialog modal states
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [startingSprint, setStartingSprint] = useState<Sprint | null>(null);
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);
  const [completedAccordionOpen, setCompletedAccordionOpen] = useState(false);
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [dragOverSprintId, setDragOverSprintId] = useState<string | null>(null);
  const [dragOverBacklog, setDragOverBacklog] = useState(false);

  // Determine sprint statuses
  const { activeSprint, plannedSprints, closedSprints } = useMemo(() => {
    let active: Sprint | null = null;
    const planned: Sprint[] = [];
    const closed: Sprint[] = [];

    for (const s of localSprints) {
      const status = (s as any).status || s.state;
      if (status === 'ACTIVE' || status === 'active') {
        if (!active) active = s;
        else planned.push(s);
      } else if (status === 'CLOSED' || status === 'closed') {
        closed.push(s);
      } else {
        planned.push(s);
      }
    }

    // Sort planned sprints chronologically by start date or name
    planned.sort((a, b) => {
      const startA = a.startDate || '';
      const startB = b.startDate || '';
      return startA.localeCompare(startB) || a.name.localeCompare(b.name);
    });

    // Sort closed sprints by completion date descending
    closed.sort((a, b) => {
      const compA = (a as any).completed_at || (a as any).completedAt || 0;
      const compB = (b as any).completed_at || (b as any).completedAt || 0;
      return Number(compB) - Number(compA);
    });

    return { activeSprint: active, plannedSprints: planned, closedSprints: closed };
  }, [localSprints]);

  const activeSprintName = activeSprint?.name || null;

  const statusOptions =
    swimlanes.length > 0
      ? swimlanes.map((s) => s.name)
      : ['To Do', 'In Progress', 'In Review', 'Done'];

  const allSprintIdSet = useMemo(
    () => new Set(localSprints.map((s) => s.id)),
    [localSprints]
  );

  // Product Backlog issues: issues with no sprintId or pointing to an unlisted sprint
  const backlogIssues = useMemo(
    () => localIssues.filter((i) => !i.sprintId || !allSprintIdSet.has(i.sprintId)),
    [localIssues, allSprintIdSet]
  );

  // Drag and drop handler to move issues between sprints and backlog
  const handleDropIssue = async (e: React.DragEvent, targetSprintId: string | null) => {
    e.preventDefault();
    setDragOverSprintId(null);
    setDragOverBacklog(false);
    if (isViewer) return;

    const issueKey = e.dataTransfer.getData('text/plain');
    if (!issueKey) return;

    const targetIssue = localIssues.find((i) => i.key === issueKey);
    if (!targetIssue || targetIssue.sprintId === targetSprintId) return;

    // Optimistic update
    setLocalIssues((prev) =>
      prev.map((i) => (i.key === issueKey ? { ...i, sprintId: targetSprintId } : i))
    );

    try {
      await moveIssueSprintAction({ issueKey, sprintId: targetSprintId });
    } catch (err) {
      console.error('Failed to move issue:', err);
      // Revert on error
      setLocalIssues((prev) =>
        prev.map((i) => (i.key === issueKey ? { ...i, sprintId: targetIssue.sprintId } : i))
      );
    }
  };

  const handleCreateSprint = async () => {
    if (isViewer || isCreatingSprint) return;
    setIsCreatingSprint(true);
    try {
      const projectId = localIssues[0]?.projectId || undefined;
      const res = await createSprintAction({ projectId });
      if (res.success && res.sprint) {
        setLocalSprints((prev) => [...prev, res.sprint!]);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apextrack:sprint-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to create sprint:', err);
    } finally {
      setIsCreatingSprint(false);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (isViewer) return;
    try {
      const res = await deleteSprintAction({ sprintId });
      if (res.success) {
        // Remove sprint from local list and move its issues to backlog
        setLocalSprints((prev) => prev.filter((s) => s.id !== sprintId));
        setLocalIssues((prev) =>
          prev.map((i) => (i.sprintId === sprintId ? { ...i, sprintId: null } : i))
        );
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apextrack:sprint-updated'));
        }
      }
    } catch (err) {
      console.error('Failed to delete sprint:', err);
    }
  };

  const handleSprintUpdated = (updatedSprint: Sprint) => {
    setLocalSprints((prev) =>
      prev.map((s) => (s.id === updatedSprint.id ? updatedSprint : s))
    );
    onUpdateSprint?.(updatedSprint);
  };

  const renderIssueRow = (issue: FullIssue, isReadOnly = false) => {
    const typeCfg = getTypeConfig(issue.type);
    const priorityCfg = getPriorityConfig(issue.priority);
    const assignee = issue.assignee;
    const TypeIcon = typeCfg.icon;

    return (
      <div
        key={issue.key}
        draggable={!isViewer && !isReadOnly}
        onDragStart={(e) => {
          if (!isViewer && !isReadOnly) {
            e.dataTransfer.setData('text/plain', issue.key);
          }
        }}
        onClick={() => onSelectIssue(issue.key)}
        className="group flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 cursor-pointer transition select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-4">
          {!isViewer && !isReadOnly && (
            <span className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          )}
          <span className={`p-1 rounded border flex-shrink-0 ${typeCfg.color}`}>
            <TypeIcon className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 w-24 flex-shrink-0">
            {issue.key}
          </span>
          {issue.parent && (
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 truncate max-w-[120px]"
              style={{
                backgroundColor: `${issue.parent.epicColor || '#3B82F6'}15`,
                borderColor: `${issue.parent.epicColor || '#3B82F6'}40`,
                color: issue.parent.epicColor || '#3B82F6',
              }}
            >
              {issue.parent.title || issue.parent.key}
            </span>
          )}
          {issue.blockedByIssues && issue.blockedByIssues.some((b) => b.status.toLowerCase() !== 'done') && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex-shrink-0">
              Blocked
            </span>
          )}
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate flex-1">
            {issue.title}
          </span>
          {issue.labels?.map((lbl, idx) => (
            <span
              key={idx}
              className="hidden lg:inline text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded"
            >
              {lbl}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-mono ${priorityCfg.color}`}
          >
            {issue.priority}
          </span>

          {!isReadOnly ? (
            <select
              value={issue.status}
              disabled={isViewer}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onStatusChange(issue.key, e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
              {issue.status}
            </span>
          )}

          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
            {issue.storyPoints || 0} pts
          </span>

          <UserAvatar
            user={assignee}
            size="sm"
            title={assignee ? assignee.name : 'Unassigned'}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span>Backlog & Sprint Planning</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plan arbitrary future sprints, activate iterations with single-active governance, and roll over incomplete tasks.
          </p>
        </div>

        {!isViewer && (
          <button
            onClick={handleCreateSprint}
            disabled={isCreatingSprint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {isCreatingSprint ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Sprint</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 1. Active Sprint Container (Top Container) */}
      {activeSprint && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverSprintId(activeSprint.id);
          }}
          onDragLeave={() => setDragOverSprintId(null)}
          onDrop={(e) => handleDropIssue(e, activeSprint.id)}
          className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition overflow-hidden ${
            dragOverSprintId === activeSprint.id
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          {(() => {
            const sprintIssues = localIssues.filter((i) => i.sprintId === activeSprint.id);
            const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

            return (
              <>
                <SprintHeader
                  sprint={activeSprint}
                  issueCount={sprintIssues.length}
                  totalPoints={totalPoints}
                  activeSprintName={activeSprintName}
                  onEditSprint={(s) => setEditingSprint(s)}
                  onCompleteSprint={(s) => setCompletingSprint(s)}
                  onAddIssue={onCreateIssue}
                  isViewer={isViewer}
                />
                <div>
                  {sprintIssues.map((issue) => renderIssueRow(issue))}
                  {sprintIssues.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700/50 m-3 rounded-xl">
                      Drag issues here or click &quot;Add Issue&quot; to commit work to the active sprint.
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* 2. Planned Sprints Containers (Middle Container, stacked chronologically) */}
      <div className="space-y-4">
        {plannedSprints.map((sprint) => {
          const sprintIssues = localIssues.filter((i) => i.sprintId === sprint.id);
          const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

          return (
            <div
              key={sprint.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverSprintId(sprint.id);
              }}
              onDragLeave={() => setDragOverSprintId(null)}
              onDrop={(e) => handleDropIssue(e, sprint.id)}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition overflow-hidden ${
                dragOverSprintId === sprint.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <SprintHeader
                sprint={sprint}
                issueCount={sprintIssues.length}
                totalPoints={totalPoints}
                activeSprintName={activeSprintName}
                onEditSprint={(s) => setEditingSprint(s)}
                onStartSprint={(s) => setStartingSprint(s)}
                onDeleteSprint={(sId) => handleDeleteSprint(sId)}
                onAddIssue={onCreateIssue}
                isViewer={isViewer}
              />
              <div>
                {sprintIssues.map((issue) => renderIssueRow(issue))}
                {sprintIssues.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700/50 m-3 rounded-xl">
                    Plan future backlog tasks here. Drag items from Product Backlog.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Product Backlog Container (Unassigned Items, sprint_id IS NULL) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverBacklog(true);
        }}
        onDragLeave={() => setDragOverBacklog(false)}
        onDrop={(e) => handleDropIssue(e, null)}
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition overflow-hidden ${
          dragOverBacklog
            ? 'border-purple-500 ring-2 ring-purple-500/20'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span>Product Backlog</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {backlogIssues.length} {backlogIssues.length === 1 ? 'issue' : 'issues'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unassigned backlog items available for future sprint planning. Drag cards into any sprint above.
            </p>
          </div>
          <button
            onClick={onCreateIssue}
            disabled={isViewer}
            className="flex items-center gap-1.5 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Backlog
          </button>
        </div>
        <div>
          {backlogIssues.map((issue) => renderIssueRow(issue))}
          {backlogIssues.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Product Backlog is empty! All items are assigned to planned or active sprints.
            </div>
          )}
        </div>
      </div>

      {/* 4. Completed Sprints Container (Bottom Container, Collapsible Accordion by Default) */}
      {closedSprints.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={() => setCompletedAccordionOpen((v) => !v)}
            className="w-full p-4 bg-slate-50/70 dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Archived Sprints History
              </span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {closedSprints.length} {closedSprints.length === 1 ? 'sprint' : 'sprints'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>{completedAccordionOpen ? 'Hide History' : 'View Closed Sprints'}</span>
              {completedAccordionOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {completedAccordionOpen && (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {closedSprints.map((sprint) => {
                const sprintIssues = localIssues.filter((i) => i.sprintId === sprint.id);
                const totalPoints = sprintIssues.reduce(
                  (sum, i) => sum + (i.storyPoints || 0),
                  0
                );
                const completedAt = (sprint as any).completed_at || (sprint as any).completedAt;

                return (
                  <div key={sprint.id} className="p-4 space-y-3 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {sprint.name}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          Closed {completedAt ? formatDateDisplay(completedAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                          {totalPoints} pts burned
                        </span>
                        <span className="text-slate-500">
                          {sprintIssues.length} issues completed
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                      {sprintIssues.map((issue) => renderIssueRow(issue, true))}
                      {sprintIssues.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No issues archived with this sprint.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Sprint Modal */}
      {editingSprint && (
        <EditSprintModal
          key={editingSprint.id}
          sprint={editingSprint}
          isOpen={Boolean(editingSprint)}
          onClose={() => setEditingSprint(null)}
          onSprintUpdated={handleSprintUpdated}
        />
      )}

      {/* Start Sprint Modal */}
      {startingSprint && (
        <StartSprintModal
          key={startingSprint.id}
          sprint={startingSprint}
          isOpen={Boolean(startingSprint)}
          onClose={() => setStartingSprint(null)}
          onSprintStarted={(s) => {
            setLocalSprints((prev) =>
              prev.map((item) =>
                item.id === s.id
                  ? { ...item, status: 'ACTIVE' as any, state: 'active' }
                  : (item as any).status === 'ACTIVE' || item.state === 'active'
                  ? { ...item, status: 'PLANNED' as any, state: 'upcoming' }
                  : item
              )
            );
            handleSprintUpdated(s);
          }}
        />
      )}

      {/* Complete Sprint Modal */}
      {completingSprint && (
        <CompleteSprintModal
          key={completingSprint.id}
          sprint={completingSprint}
          sprintIssues={localIssues.filter((i) => i.sprintId === completingSprint.id)}
          plannedSprints={plannedSprints}
          isOpen={Boolean(completingSprint)}
          onClose={() => setCompletingSprint(null)}
          onSprintCompleted={() => {
            setLocalSprints((prev) =>
              prev.map((s) =>
                s.id === completingSprint.id
                  ? { ...s, status: 'CLOSED' as any, state: 'closed', completed_at: Date.now() as any }
                  : s
              )
            );
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('apextrack:sprint-updated'));
            }
          }}
        />
      )}
    </div>
  );
}
