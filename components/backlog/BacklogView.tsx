'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Inbox } from 'lucide-react';
import { FullIssue, User, Swimlane, Sprint } from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SprintHeader } from '@/components/backlog/SprintHeader';
import { EditSprintModal } from '@/components/sprints/EditSprintModal';

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

export function BacklogView({
  issues,
  sprints,
  swimlanes = [],
  onSelectIssue,
  onStatusChange,
  onCreateIssue,
  onUpdateSprint,
  isViewer,
}: BacklogViewProps) {
  const [localOverrides, setLocalOverrides] = useState<Record<string, Sprint>>({});
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const sprintList = useMemo(() => {
    const base = sprints && sprints.length > 0 ? sprints : DEFAULT_SPRINTS;
    return base.map((s) => localOverrides[s.id] || s);
  }, [sprints, localOverrides]);

  const handleSprintUpdated = (updatedSprint: Sprint) => {
    setLocalOverrides((prev) => ({ ...prev, [updatedSprint.id]: updatedSprint }));
    onUpdateSprint?.(updatedSprint);
  };

  const statusOptions =
    swimlanes.length > 0
      ? swimlanes.map((s) => s.name)
      : ['To Do', 'In Progress', 'In Review', 'Done'];

  const sprintIdSet = useMemo(
    () => new Set(sprintList.map((s) => s.id)),
    [sprintList]
  );

  const backlogIssues = useMemo(
    () => issues.filter((i) => !i.sprintId || !sprintIdSet.has(i.sprintId)),
    [issues, sprintIdSet]
  );

  const renderIssueRow = (issue: FullIssue) => {
    const typeCfg = getTypeConfig(issue.type);
    const priorityCfg = getPriorityConfig(issue.priority);
    const assignee = issue.assignee;
    const TypeIcon = typeCfg.icon;

    return (
      <div
        key={issue.key}
        onClick={() => onSelectIssue(issue.key)}
        className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 hover:bg-blue-50/40 dark:hover:bg-slate-700/50 cursor-pointer transition"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
          <span className={`p-1 rounded border flex-shrink-0 ${typeCfg.color}`}>
            <TypeIcon className="w-3.5 h-3.5" />
          </span>
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 w-24 flex-shrink-0">
            {issue.key}
          </span>
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
      {/* Sprints Sections (Active, Upcoming, etc.) */}
      {sprintList.map((sprint) => {
        const sprintIssues = issues.filter((i) => i.sprintId === sprint.id);
        const totalPoints = sprintIssues.reduce(
          (sum, i) => sum + (i.storyPoints || 0),
          0
        );

        return (
          <div
            key={sprint.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <SprintHeader
              sprint={sprint}
              issueCount={sprintIssues.length}
              totalPoints={totalPoints}
              onEditSprint={(s) => setEditingSprint(s)}
              onAddIssue={onCreateIssue}
              isViewer={isViewer}
            />
            <div>
              {sprintIssues.map(renderIssueRow)}
              {sprintIssues.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No issues scheduled in this sprint.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Product Backlog Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span>Product Backlog</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
                {backlogIssues.length} issues
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unscheduled backlog items staged for future sprint planning.
            </p>
          </div>
          <button
            onClick={onCreateIssue}
            disabled={isViewer}
            className="flex items-center gap-1.5 text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-md font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Backlog
          </button>
        </div>
        <div>
          {backlogIssues.map(renderIssueRow)}
          {backlogIssues.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Backlog is empty! All items are assigned to sprints.
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
