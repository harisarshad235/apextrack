'use client';

import React, { useState } from 'react';
import { Plus, X, Layers, Clock, Hash, Palette, AlertCircle } from 'lucide-react';
import { User, IssueType, IssuePriority, Project, Swimlane, FullIssue, Sprint } from '@/lib/types';
import { createIssue } from '@/app/actions/issues';

interface CreateIssueModalProps {
  users: User[];
  currentUser: User;
  projects?: Project[];
  activeProjectId?: string;
  swimlanes?: Swimlane[];
  issues?: FullIssue[];
  sprints?: Sprint[];
  onClose: () => void;
  onCreate: (newIssueData: Parameters<typeof createIssue>[0]) => void;
}

const EPIC_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

export function CreateIssueModal({
  users,
  currentUser,
  projects = [],
  activeProjectId,
  swimlanes = [],
  issues = [],
  sprints = [],
  onClose,
  onCreate,
}: CreateIssueModalProps) {
  const [projectId, setProjectId] = useState(activeProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<IssueType>('Story');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [status, setStatus] = useState<string>(swimlanes[0]?.name || 'To Do');
  const [assigneeId, setAssigneeId] = useState(currentUser?.id || users[0]?.id || '');
  const [storyPoints, setStoryPoints] = useState<number | ''>(3);
  const [originalEstimateHours, setOriginalEstimateHours] = useState<number | ''>('');
  const [remainingEstimateHours, setRemainingEstimateHours] = useState<number | ''>('');
  const [parentIssueId, setParentIssueId] = useState<string>('');
  const [epicColor, setEpicColor] = useState<string>('#3B82F6');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter sprints for selected project or active project
  const availableSprints = React.useMemo(() => {
    return (sprints || []).filter(
      (s) => !projectId || !(s as any).projectId || (s as any).projectId === projectId
    );
  }, [sprints, projectId]);

  // Find active sprint to pre-select, or upcoming, or Backlog
  const defaultSprint = React.useMemo(() => {
    const active = availableSprints.find(
      (s) => ((s as any).status || s.state || '').toUpperCase() === 'ACTIVE'
    );
    if (active) return active.id;
    const upcoming = availableSprints.find(
      (s) => ((s as any).status || s.state || '').toUpperCase() !== 'CLOSED'
    );
    return upcoming ? upcoming.id : 'Backlog';
  }, [availableSprints]);

  const [sprintId, setSprintId] = useState<string>(defaultSprint);

  React.useEffect(() => {
    setSprintId(defaultSprint);
  }, [defaultSprint]);

  const [labels, setLabels] = useState('Feature, Frontend');
  const [description, setDescription] = useState('');

  // Available epics for Stories/Tasks/Bugs
  const epics = issues.filter(
    (i) => (i.issueType || i.type || '').toUpperCase() === 'EPIC' && (!projectId || i.projectId === projectId)
  );

  // Available parent issues for Subtasks (Stories, Tasks, Bugs)
  const subtaskParents = issues.filter((i) => {
    const t = (i.issueType || i.type || '').toUpperCase();
    return (t === 'STORY' || t === 'TASK' || t === 'BUG') && (!projectId || i.projectId === projectId);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('Please provide an issue summary/title.');
      return;
    }

    if (type === 'Subtask' && !parentIssueId) {
      setValidationError('Subtasks must be linked to a parent Story, Task, or Bug.');
      return;
    }

    onCreate({
      projectId: projectId || undefined,
      parentIssueId: parentIssueId || null,
      title: title.trim(),
      type,
      issueType: type.toUpperCase(),
      epicColor: type === 'Epic' ? epicColor : undefined,
      priority,
      status,
      assigneeId: assigneeId || null,
      storyPoints: storyPoints !== '' ? Number(storyPoints) : undefined,
      originalEstimateHours: originalEstimateHours !== '' ? Number(originalEstimateHours) : null,
      remainingEstimateHours:
        remainingEstimateHours !== ''
          ? Number(remainingEstimateHours)
          : originalEstimateHours !== ''
          ? Number(originalEstimateHours)
          : null,
      sprintId: sprintId === 'Backlog' ? null : sprintId,
      labelsList: labels
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" /> Create Enterprise Issue
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Project Selector */}
          {projects.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setParentIssueId('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    [{p.key}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Issue Type */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Issue Type
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['Story', 'Bug', 'Task', 'Epic', 'Subtask'] as IssueType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    setType(t);
                    setParentIssueId('');
                  }}
                  className={`py-2 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1 transition text-xs ${
                    type === t
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Epic Color Picker if Epic */}
          {type === 'Epic' && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-blue-500" /> Epic Color Tag
              </label>
              <div className="flex items-center gap-2">
                {EPIC_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setEpicColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      epicColor === c ? 'border-white ring-2 ring-blue-500 scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Parent Issue Selector for Subtask */}
          {type === 'Subtask' && (
            <div>
              <label className="block font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Parent Story / Task / Bug (Required) *
              </label>
              <select
                required
                value={parentIssueId}
                onChange={(e) => setParentIssueId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-amber-500/50 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select Parent Issue...</option>
                {subtaskParents.map((p) => (
                  <option key={p.key} value={p.key}>
                    [{p.key}] ({p.issueType || p.type}) {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Optional Parent Epic for Story / Task / Bug */}
          {(type === 'Story' || type === 'Task' || type === 'Bug') && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" /> Parent Epic (Optional)
              </label>
              <select
                value={parentIssueId}
                onChange={(e) => setParentIssueId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">None (Standalone)</option>
                {epics.map((epic) => (
                  <option key={epic.key} value={epic.key}>
                    [{epic.key}] {epic.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Summary / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Cloudflare D1 query caching"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Lowest">Lowest</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Story Points & Sprint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-blue-500" /> Story Points
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 3"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sprint
              </label>
              <select
                value={sprintId}
                onChange={(e) => setSprintId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              >
                {availableSprints.map((s) => {
                  const stateStr = ((s as any).status || s.state || '').toUpperCase();
                  const stateLabel =
                    stateStr === 'ACTIVE'
                      ? 'Active'
                      : stateStr === 'CLOSED'
                      ? 'Closed'
                      : 'Upcoming';
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({stateLabel})
                    </option>
                  );
                })}
                <option value="Backlog">Product Backlog</option>
              </select>
            </div>
          </div>

          {/* Time Tracking Estimates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Original Estimate (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={originalEstimateHours}
                onChange={(e) => setOriginalEstimateHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 8"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Remaining Estimate (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={remainingEstimateHours}
                onChange={(e) => setRemainingEstimateHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Defaults to original"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {swimlanes.length > 0 && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Initial Status / Swimlane
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 font-medium text-slate-900 dark:text-white"
              >
                {swimlanes.map((sl) => (
                  <option key={sl.id} value={sl.name}>
                    {sl.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Labels (comma-separated)
            </label>
            <input
              type="text"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="Backend, API, Cloudflare"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description (Markdown supported)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed acceptance criteria, reproduction steps..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
