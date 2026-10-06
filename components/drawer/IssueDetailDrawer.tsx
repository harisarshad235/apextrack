'use client';

import React, { useState, useRef, useTransition, useEffect } from 'react';
import {
  Trash2,
  X,
  FileText,
  Download,
  Plus,
  Edit3,
  Flag,
  Link2,
  ListChecks,
} from 'lucide-react';
import { FullIssue, User, IssueStatus, Attachment, IssueType, IssuePriority, Swimlane, Subtask } from '@/lib/types';
import { LinkType } from '@/db/schema';
import { COLUMNS, getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  toggleIssueFlag,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addIssueLink,
  removeIssueLink,
} from '@/app/actions/issues';

const LINK_LABELS: Record<LinkType, string> = {
  blocks: 'blocks',
  is_blocked_by: 'is blocked by',
  relates_to: 'relates to',
};
const INVERSE_LINK: Record<LinkType, LinkType> = {
  blocks: 'is_blocked_by',
  is_blocked_by: 'blocks',
  relates_to: 'relates_to',
};

interface IssueDetailDrawerProps {
  issue: FullIssue;
  users: User[];
  currentUser: User;
  swimlanes?: Swimlane[];
  allIssues?: FullIssue[];
  onNavigateIssue?: (issueKey: string) => void;
  isViewer: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onDelete: () => void;
  onUpdateIssue: (data: {
    title?: string;
    description?: string;
    type?: IssueType;
    priority?: IssuePriority;
    assigneeId?: string | null;
    storyPoints?: number;
    sprintId?: string | null;
  }) => void;
  onAddComment: (commentText: string) => void;
  onUploadSuccess: (attachment: Attachment) => void;
}

export function IssueDetailDrawer({
  issue,
  users,
  currentUser,
  swimlanes = [],
  allIssues = [],
  onNavigateIssue,
  isViewer,
  onClose,
  onStatusChange,
  onDelete,
  onUpdateIssue,
  onAddComment,
  onUploadSuccess,
}: IssueDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'attachments'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(issue.title);
  const [descInput, setDescInput] = useState(issue.description || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(issue.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('relates_to');
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    setLocalSubtasks(issue.subtasks || []);
  }, [issue.key, issue.subtasks]);

  const doneSubtasks = localSubtasks.filter((s) => s.completed).length;
  const subtaskPct = localSubtasks.length ? Math.round((doneSubtasks / localSubtasks.length) * 100) : 0;

  const handleToggleSubtask = (s: Subtask) => {
    setLocalSubtasks((prev) => prev.map((x) => (x.id === s.id ? { ...x, completed: !s.completed } : x)));
    startTransition(async () => {
      await toggleSubtask(s.id, !s.completed);
    });
  };

  const handleAddSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    const tempId = `tmp-${Date.now()}`;
    setLocalSubtasks((prev) => [
      ...prev,
      { id: tempId, issueId: issue.key, title, completed: false, sortOrder: prev.length },
    ]);
    setNewSubtask('');
    startTransition(async () => {
      await addSubtask(issue.key, title);
    });
  };

  const handleDeleteSubtask = (id: string) => {
    setLocalSubtasks((prev) => prev.filter((x) => x.id !== id));
    startTransition(async () => {
      await deleteSubtask(id);
    });
  };

  const handleAddLink = () => {
    if (!linkTarget.trim()) return;
    setLinkError('');
    startTransition(async () => {
      const res = await addIssueLink(issue.key, linkTarget, linkType);
      if (res.success) setLinkTarget('');
      else setLinkError(res.error || 'Failed to link');
    });
  };

  const linkedChips = (issue.links || []).map((l) => {
    const outgoing = l.sourceIssueId === issue.key;
    const otherKey = outgoing ? l.targetIssueId : l.sourceIssueId;
    const rel = outgoing ? l.relationType : INVERSE_LINK[l.relationType];
    return { link: l, otherKey, rel, other: allIssues.find((i) => i.key === otherKey) };
  });

  const statusDot = (status?: string) =>
    status === 'Done'
      ? 'bg-emerald-500'
      : status === 'In Progress'
      ? 'bg-blue-500'
      : status === 'In Review'
      ? 'bg-purple-500'
      : 'bg-slate-400';

  useEffect(() => {
    setTitleInput(issue.title);
    setDescInput(issue.description || '');
  }, [issue.key, issue.title, issue.description]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typeCfg = getTypeConfig(issue.type);
  const priorityCfg = getPriorityConfig(issue.priority);
  const TypeIcon = typeCfg.icon;

  const assignee = issue.assignee;
  const reporter = issue.reporter;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('issueKey', issue.key);

      const res = await fetch('/api/attachments', {
        method: 'POST',
        body: formData,
      });

      const json = (await res.json()) as { attachment?: Attachment; error?: string };
      if (res.ok && json.attachment) {
        onUploadSuccess(json.attachment);
      } else {
        alert(json.error || 'Failed to upload attachment');
      }
    } catch {
      alert('Network error while uploading file to R2 bucket');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveComment = () => {
    if (!commentText.trim()) return;
    startTransition(() => {
      onAddComment(commentText);
      setCommentText('');
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            {/* Issue Type Selector */}
            <div className="flex items-center">
              <span className={`p-1.5 rounded-l border border-r-0 ${typeCfg.color}`}>
                <TypeIcon className="w-4 h-4" />
              </span>
              {isViewer ? (
                <span className="text-xs font-bold px-2 py-1 border border-l-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-r text-slate-800 dark:text-slate-200">
                  {issue.type}
                </span>
              ) : (
                <select
                  disabled={isPending}
                  value={issue.type}
                  onChange={(e) => onUpdateIssue({ type: e.target.value as IssueType })}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold px-2 py-1 rounded-r text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                  <option value="Bug">Bug</option>
                  <option value="Epic">Epic</option>
                </select>
              )}
            </div>

            <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
              {issue.key}
            </span>

            {/* Quick Status Dropdown */}
            <select
              value={issue.status}
              disabled={isViewer || isPending}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold px-3 py-1 rounded-md text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {swimlanes.length > 0 ? (
                swimlanes.map((lane) => (
                  <option key={lane.id} value={lane.name}>
                    {lane.name}
                  </option>
                ))
              ) : (
                COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {!isViewer && (
              <button
                onClick={() => startTransition(async () => { await toggleIssueFlag(issue.key); })}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                  issue.isFlagged
                    ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-500 hover:text-amber-600'
                }`}
                title={issue.isFlagged ? 'Remove impediment flag' : 'Flag as impediment'}
              >
                <Flag className="w-3.5 h-3.5" />
                {issue.isFlagged ? 'Remove Flag' : 'Add Flag'}
              </button>
            )}
            {!isViewer && (
              <button
                onClick={onDelete}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                title="Delete issue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Issue Title */}
          <div>
            {isEditingTitle && !isViewer ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onUpdateIssue({ title: titleInput });
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 text-lg font-bold bg-white dark:bg-slate-800 border border-blue-500 rounded p-1.5 text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    onUpdateIssue({ title: titleInput });
                    setIsEditingTitle(false);
                  }}
                  className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setTitleInput(issue.title);
                    setIsEditingTitle(false);
                  }}
                  className="px-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <h2
                  onClick={() => !isViewer && setIsEditingTitle(true)}
                  className={`text-xl font-bold text-slate-900 dark:text-white ${
                    !isViewer
                      ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 p-1 -m-1 rounded transition'
                      : ''
                  }`}
                  title={!isViewer ? 'Click to edit title' : ''}
                >
                  {issue.title}
                </h2>
                {!isViewer && (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition"
                    title="Edit title"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Core Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Assignee */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Assignee</span>
              {isViewer ? (
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <>
                      <UserAvatar user={assignee} size="xs" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </div>
              ) : (
                <select
                  value={issue.assigneeId || ''}
                  onChange={(e) =>
                    onUpdateIssue({
                      assigneeId: e.target.value === '' ? null : e.target.value,
                    })
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold px-2 py-1 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer truncate"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Reporter */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Reporter</span>
              <div className="flex items-center gap-2 py-1">
                {reporter && (
                  <>
                    <UserAvatar user={reporter} size="xs" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {reporter.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Priority</span>
              {isViewer ? (
                <span className={`px-2 py-0.5 rounded font-mono font-medium ${priorityCfg.color}`}>
                  {priorityCfg.icon} {issue.priority}
                </span>
              ) : (
                <select
                  value={issue.priority}
                  onChange={(e) =>
                    onUpdateIssue({ priority: e.target.value as IssuePriority })
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold px-2 py-1 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Critical">▲▲ Critical</option>
                  <option value="High">▲ High</option>
                  <option value="Medium">■ Medium</option>
                  <option value="Low">▼ Low</option>
                  <option value="Lowest">▼▼ Lowest</option>
                </select>
              )}
            </div>

            {/* Story Points */}
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Story Points</span>
              {isViewer ? (
                <span className="font-mono font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                  {issue.storyPoints || 0} pts
                </span>
              ) : (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={issue.storyPoints ?? 0}
                  onChange={(e) =>
                    onUpdateIssue({ storyPoints: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-bold px-2 py-1 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Description Box */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Description
            </h3>
            <textarea
              rows={4}
              disabled={isViewer}
              value={descInput}
              onChange={(e) => setDescInput(e.target.value)}
              onBlur={() => onUpdateIssue({ description: descInput })}
              placeholder="Add a detailed description or reproduction steps..."
              className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" /> Subtasks
              </h3>
              {localSubtasks.length > 0 && (
                <span className="text-[11px] font-mono text-slate-500">
                  {doneSubtasks} of {localSubtasks.length} completed
                </span>
              )}
            </div>
            {localSubtasks.length > 0 && (
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${subtaskPct}%` }}
                />
              </div>
            )}
            <ul className="space-y-1">
              {localSubtasks.map((s) => (
                <li key={s.id} className="flex items-center gap-2 group text-xs py-1">
                  <input
                    type="checkbox"
                    checked={s.completed}
                    disabled={isViewer}
                    onChange={() => handleToggleSubtask(s)}
                    className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                  />
                  <span
                    className={`flex-1 ${
                      s.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {s.title}
                  </span>
                  {!isViewer && (
                    <button
                      onClick={() => handleDeleteSubtask(s.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition"
                      title="Delete subtask"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {!isViewer && (
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add a subtask and press Enter..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Linked Issues */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> Linked Issues ({linkedChips.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {linkedChips.map(({ link, otherKey, rel, other }) => (
                <span
                  key={link.id}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <span className="text-slate-400">{LINK_LABELS[rel]}</span>
                  <button
                    onClick={() => onNavigateIssue?.(otherKey)}
                    className="flex items-center gap-1.5 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    title={other?.title || otherKey}
                  >
                    <span className={`w-2 h-2 rounded-full ${statusDot(other?.status)}`} />
                    {otherKey}
                  </button>
                  {other && <span className="text-slate-400 hidden sm:inline">{other.status}</span>}
                  {!isViewer && (
                    <button
                      onClick={() => startTransition(async () => { await removeIssueLink(link.id); })}
                      className="text-slate-400 hover:text-red-500"
                      title="Remove link"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {linkedChips.length === 0 && (
                <p className="text-xs text-slate-400 italic">No linked issues.</p>
              )}
            </div>
            {!isViewer && (
              <div className="space-y-1">
                <div className="flex gap-2">
                  <select
                    value={linkType}
                    onChange={(e) => setLinkType(e.target.value as LinkType)}
                    className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200"
                  >
                    <option value="blocks">blocks</option>
                    <option value="is_blocked_by">is blocked by</option>
                    <option value="relates_to">relates to</option>
                  </select>
                  <input
                    list="link-issue-options"
                    value={linkTarget}
                    onChange={(e) => setLinkTarget(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
                    placeholder="e.g. APEX-102"
                    className="flex-1 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <datalist id="link-issue-options">
                    {allIssues
                      .filter((i) => i.key !== issue.key)
                      .map((i) => (
                        <option key={i.key} value={i.key}>
                          {i.title}
                        </option>
                      ))}
                  </datalist>
                  <button
                    onClick={handleAddLink}
                    className="px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Link
                  </button>
                </div>
                {linkError && <p className="text-[11px] text-red-500">{linkError}</p>}
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Attachments ({issue.attachments?.length || 0})
              </h3>
              {!isViewer && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isUploading ? 'Uploading to R2...' : 'Attach File'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {issue.attachments?.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {att.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(att.sizeBytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/attachments/${att.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-blue-600"
                    title="Download from R2"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
              {(!issue.attachments || issue.attachments.length === 0) && (
                <div className="col-span-2 py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-center text-xs text-slate-400">
                  No files or specs attached to this issue.
                </div>
              )}
            </div>
          </div>

          {/* Activity Tabs (Comments / Audit History) */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('comments')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'comments'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Comments ({issue.comments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'history'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                History ({issue.history?.length || 0})
              </button>
            </div>

            {activeTab === 'comments' && (
              <div className="space-y-4">
                {/* Add Comment Input */}
                {!isViewer && (
                  <div className="flex gap-3">
                    <UserAvatar user={currentUser} size="sm" className="mt-1" />
                    <div className="flex-1 space-y-2">
                      <textarea
                        rows={2}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment... (use @name to mention)"
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {commentText.trim() && (
                        <button
                          onClick={handleSaveComment}
                          disabled={isPending}
                          className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                        >
                          Save Comment
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Comment Thread */}
                <div className="space-y-3">
                  {issue.comments?.map((c) => {
                    const author = c.author || users.find((u) => u.id === c.authorId);
                    const formattedDate = new Date(c.createdAt).toISOString().replace('T', ' ').substring(0, 16);

                    return (
                      <div
                        key={c.id}
                        className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <UserAvatar user={author} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {author?.name || 'User'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formattedDate}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {c.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {(!issue.comments || issue.comments.length === 0) && (
                    <p className="text-xs text-slate-400 italic">
                      No comments yet. Start the discussion.
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2">
                {issue.history?.map((h) => {
                  const formattedDate = new Date(h.createdAt).toISOString().replace('T', ' ').substring(0, 16);

                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-100">
                          {h.actorName}
                        </strong>{' '}
                        {h.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formattedDate}
                      </span>
                    </div>
                  );
                })}
                {(!issue.history || issue.history.length === 0) && (
                  <p className="text-xs text-slate-400 italic">
                    No recorded activity history.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

