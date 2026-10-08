'use client';

import React, { useState, useRef, useTransition, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  GitBranch,
  GitPullRequest,
  GitCommit,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye,
  CornerDownRight,
  ShieldAlert,
} from 'lucide-react';
import {
  FullIssue,
  User,
  IssueStatus,
  Attachment,
  IssueType,
  IssuePriority,
  Swimlane,
  Subtask,
  IssueLink,
  EnterpriseLinkType,
  IssueGitLink,
  IssueAuditLog,
} from '@/lib/types';
import { getTypeConfig, getPriorityConfig } from '@/lib/config';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  toggleIssueFlag,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  linkIssuesAction,
  unlinkIssuesAction,
  logWorkAction,
} from '@/app/actions/issues';
import { transitionIssueStatusAction } from '@/app/actions/workflows';
import { linkGitRefAction, unlinkGitRefAction } from '@/app/actions/git';

const LINK_LABELS: Record<string, string> = {
  blocks: 'blocks',
  is_blocked_by: 'is blocked by',
  relates_to: 'relates to',
  duplicates: 'duplicates',
  BLOCKS: 'blocks',
  IS_BLOCKED_BY: 'is blocked by',
  RELATES_TO: 'relates to',
  DUPLICATES: 'duplicates',
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
    issueType?: string;
    epicColor?: string;
    priority?: IssuePriority;
    assigneeId?: string | null;
    parentIssueId?: string | null;
    storyPoints?: number;
    originalEstimateHours?: number | null;
    remainingEstimateHours?: number | null;
    sprintId?: string | null;
  }) => void;
  onAddComment: (commentText: string) => void;
  onUploadSuccess?: (attachment: Attachment) => void;
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
  const [activeTab, setActiveTab] = useState<'comments' | 'history' | 'worklog'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(issue.title);
  const [descInput, setDescInput] = useState(issue.description || '');
  const [isPreviewDesc, setIsPreviewDesc] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Subtasks & Linking local states
  const [localSubtasks, setLocalSubtasks] = useState<Subtask[]>(issue.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [linkTarget, setLinkTarget] = useState('');
  const [linkType, setLinkType] = useState<EnterpriseLinkType>('BLOCKS');
  const [linkError, setLinkError] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Git Link modal
  const [isAddingGit, setIsAddingGit] = useState(false);
  const [gitRefType, setGitRefType] = useState<'BRANCH' | 'PULL_REQUEST' | 'COMMIT'>('PULL_REQUEST');
  const [gitRefName, setGitRefName] = useState('');
  const [gitUrl, setGitUrl] = useState('');
  const [gitRepo, setGitRepo] = useState('org/apextrack');

  // Work Log modal
  const [isLogWorkOpen, setIsLogWorkOpen] = useState(false);
  const [logHoursSpent, setLogHoursSpent] = useState<number>(1);
  const [logRemainingHours, setLogRemainingHours] = useState<number | ''>(
    issue.remainingEstimateHours ?? Math.max(0, (issue.originalEstimateHours ?? 0) - 1)
  );
  const [logComment, setLogComment] = useState('');

  // Transition & Blocker Error State
  const [transitionError, setTransitionError] = useState<{
    message: string;
    isBlocked?: boolean;
    targetStatusId?: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setTitleInput(issue.title);
    setDescInput(issue.description || '');
    setLocalSubtasks(issue.subtasks || []);
    setTransitionError(null);
  }, [issue.key, issue.title, issue.description, issue.subtasks]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const doneSubtasks = localSubtasks.filter((s) => s.completed).length;
  const subtaskPct = localSubtasks.length ? Math.round((doneSubtasks / localSubtasks.length) * 100) : 0;

  // Resolving parent Epics & Available Epics
  const availableEpics = useMemo(() => {
    return allIssues.filter(
      (i) =>
        i.key !== issue.key &&
        ((i.issueType || i.type || '').toUpperCase() === 'EPIC')
    );
  }, [allIssues, issue.key]);

  const parentEpic = useMemo(() => {
    if (issue.parent) return issue.parent;
    if (issue.parentIssueId) {
      return allIssues.find((i) => i.key === issue.parentIssueId) || null;
    }
    return null;
  }, [issue.parent, issue.parentIssueId, allIssues]);

  // Blockers analysis
  const unresolvedBlockers = useMemo(() => {
    return (issue.blockedByIssues || []).filter(
      (b) => b.status.toLowerCase() !== 'done'
    );
  }, [issue.blockedByIssues]);

  const resolvedType = (issue.issueType || issue.type || 'TASK').toUpperCase();
  const typeConfig = getTypeConfig(issue.type);
  const priorityConfig = getPriorityConfig(issue.priority);

  // Status transition handler with rule enforcement
  const handleTransitionStatus = async (targetStatus: string, override = false) => {
    if (isViewer) {
      showToast('Viewers cannot change status.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await transitionIssueStatusAction({
        issueId: issue.key,
        targetStatusId: targetStatus,
        overrideBlockers: override,
      });

      if (res.success) {
        setTransitionError(null);
        onStatusChange(targetStatus);
        showToast(res.message || `Moved to ${targetStatus}`);
      } else {
        setTransitionError({
          message: res.error || 'Failed to move issue.',
          isBlocked: res.isBlocked,
          targetStatusId: targetStatus,
        });
        showToast(res.error || 'Transition denied by workflow rules', 'error');
      }
    });
  };

  const handleSaveTitle = () => {
    if (!titleInput.trim() || titleInput === issue.title) {
      setIsEditingTitle(false);
      return;
    }
    onUpdateIssue({ title: titleInput.trim() });
    setIsEditingTitle(false);
    showToast('Title updated');
  };

  const handleSaveDescription = () => {
    onUpdateIssue({ description: descInput.trim() });
    setIsEditingDesc(false);
    showToast('Description updated');
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const title = newSubtask.trim();
    setNewSubtask('');

    startTransition(async () => {
      const res = await addSubtask(issue.key, title);
      if (res.success) {
        setLocalSubtasks((prev) => [
          ...prev,
          {
            id: res.id || `st-${Date.now()}`,
            issueId: issue.key,
            title,
            completed: false,
            sortOrder: prev.length,
          },
        ]);
        showToast('Subtask added');
      } else {
        showToast(res.error || 'Failed to add subtask', 'error');
      }
    });
  };

  const handleToggleSubtask = (stId: string, current: boolean) => {
    setLocalSubtasks((prev) =>
      prev.map((s) => (s.id === stId ? { ...s, completed: !current } : s))
    );
    startTransition(async () => {
      const res = await toggleSubtask(stId, !current);
      if (!res.success) {
        showToast('Failed to update subtask', 'error');
      }
    });
  };

  const handleDeleteSubtask = (stId: string) => {
    setLocalSubtasks((prev) => prev.filter((s) => s.id !== stId));
    startTransition(async () => {
      const res = await deleteSubtask(stId);
      if (!res.success) {
        showToast('Failed to delete subtask', 'error');
      }
    });
  };

  const handleAddLink = async () => {
    if (!linkTarget.trim()) return;
    setLinkError('');
    startTransition(async () => {
      const res = await linkIssuesAction({
        sourceIssueId: issue.key,
        targetIssueId: linkTarget.trim(),
        linkType,
      });

      if (res.success) {
        showToast(res.message || 'Issues linked successfully');
        setIsAddingLink(false);
        setLinkTarget('');
      } else {
        setLinkError(res.error || 'Failed to link issues');
        showToast(res.error || 'Failed to link issues', 'error');
      }
    });
  };

  const handleRemoveLink = (linkId: string) => {
    startTransition(async () => {
      const res = await unlinkIssuesAction({ linkId });
      if (res.success) {
        showToast('Link removed');
      } else {
        showToast(res.error || 'Failed to remove link', 'error');
      }
    });
  };

  const handleAddGitRef = async () => {
    if (!gitRefName.trim() || !gitUrl.trim()) return;
    startTransition(async () => {
      const res = await linkGitRefAction({
        issueId: issue.key,
        repoFullName: gitRepo.trim(),
        refType: gitRefType,
        refName: gitRefName.trim(),
        url: gitUrl.trim(),
      });

      if (res.success) {
        showToast(res.message || 'Git reference linked');
        setIsAddingGit(false);
        setGitRefName('');
        setGitUrl('');
      } else {
        showToast(res.error || 'Failed to link git ref', 'error');
      }
    });
  };

  const handleLogWork = async () => {
    if (logHoursSpent <= 0) return;
    startTransition(async () => {
      const res = await logWorkAction({
        issueKey: issue.key,
        hoursSpent: Number(logHoursSpent),
        remainingHours: logRemainingHours !== '' ? Number(logRemainingHours) : null,
        comment: logComment,
      });

      if (res.success) {
        showToast(res.message || 'Work logged');
        setIsLogWorkOpen(false);
        setLogComment('');
      } else {
        showToast(res.error || 'Failed to log work', 'error');
      }
    });
  };

  const isProjectManager =
    currentUser.role === 'Admin' ||
    (currentUser as any).department?.toUpperCase() === 'CTO' ||
    (currentUser as any).role === 'PROJECT_MANAGER';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        className="w-full max-w-4xl bg-[#0b0f17] text-slate-200 border-l border-[#263348] flex flex-col h-full shadow-2xl relative animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-drawer-title"
      >
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            className={`absolute top-4 left-6 right-6 z-50 p-3 rounded-lg text-xs font-medium flex items-center justify-between shadow-lg transition-all ${
              toastMessage.type === 'error'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0f172a]/60">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Parent Epic Breadcrumb Tag */}
            {parentEpic ? (
              <button
                onClick={() => onNavigateIssue && onNavigateIssue(parentEpic.key)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide transition border hover:opacity-80"
                style={{
                  backgroundColor: `${parentEpic.epicColor || '#3B82F6'}15`,
                  color: parentEpic.epicColor || '#3B82F6',
                  borderColor: `${parentEpic.epicColor || '#3B82F6'}40`,
                }}
                title={`Parent Epic: ${parentEpic.title}`}
              >
                <span>{parentEpic.key}</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="truncate max-w-[120px]">{parentEpic.title}</span>
              </button>
            ) : null}

            {/* Issue Key Pill */}
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-blue-400 border border-slate-700">
              {issue.key}
            </span>

            {/* Issue Type Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {resolvedType}
            </span>

            {/* Flagged impediment badge */}
            {issue.isFlagged && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                <Flag className="w-3 h-3 fill-red-400" />
                Impediment
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blocker Alert Warning Banner */}
        {unresolvedBlockers.length > 0 && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-rose-200">
                This issue is blocked by {unresolvedBlockers.length} open ticket{unresolvedBlockers.length > 1 ? 's' : ''}:
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {unresolvedBlockers.map((b) => (
                  <button
                    key={b.key}
                    onClick={() => onNavigateIssue && onNavigateIssue(b.key)}
                    className="px-2 py-0.5 rounded bg-rose-900/50 hover:bg-rose-900 border border-rose-500/40 font-mono text-[11px] text-rose-200 transition"
                  >
                    {b.key}: {b.title} ({b.status})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transition Error Modal / Banner */}
        {transitionError && (
          <div className="mx-6 mt-3 p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Workflow Transition Denied</p>
                <p className="text-amber-300/90 mt-0.5">{transitionError.message}</p>
              </div>
            </div>
            {transitionError.isBlocked && isProjectManager && transitionError.targetStatusId && (
              <button
                onClick={() => handleTransitionStatus(transitionError.targetStatusId!, true)}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition text-[11px]"
              >
                Override as PM
              </button>
            )}
          </div>
        )}

        {/* Title Area */}
        <div className="px-6 pt-4 pb-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="flex-1 bg-slate-900 border border-blue-500/50 rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              onClick={() => !isViewer && setIsEditingTitle(true)}
              className="group flex items-start justify-between cursor-pointer rounded-lg p-1.5 -ml-1.5 hover:bg-slate-800/50 transition"
              title={!isViewer ? 'Click to edit title' : ''}
            >
              <h2 id="issue-drawer-title" className="text-xl font-bold tracking-tight text-white leading-snug">
                {issue.title}
              </h2>
              {!isViewer && (
                <Edit3 className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition mt-1" />
              )}
            </div>
          )}
        </div>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Context & Work Area (7 cols) */}
          <div className="md:col-span-8 space-y-6">
            {/* Description Block */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewDesc(!isPreviewDesc)}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300"
                  >
                    <Eye className="w-3 h-3" />
                    {isPreviewDesc ? 'Edit View' : 'Preview Markdown'}
                  </button>
                  {!isViewer && !isEditingDesc && !isPreviewDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {isEditingDesc || !issue.description ? (
                <div className="space-y-2">
                  <textarea
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    placeholder="Add a detailed markdown description..."
                    rows={6}
                    className="w-full bg-[#090d16] border border-[#263348] rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleSaveDescription}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Save Description
                    </button>
                  </div>
                </div>
              ) : isPreviewDesc ? (
                <div className="prose prose-invert prose-sm max-w-none p-2 bg-[#090d16] rounded-lg border border-[#263348]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{descInput}</ReactMarkdown>
                </div>
              ) : (
                <div
                  onClick={() => !isViewer && setIsEditingDesc(true)}
                  className="prose prose-invert prose-sm max-w-none text-slate-300 cursor-pointer p-2 rounded hover:bg-white/5 transition"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{descInput}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Subtasks Checklist Block */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subtasks</span>
                </div>
                {localSubtasks.length > 0 && (
                  <span className="text-xs text-slate-400 font-mono">
                    {doneSubtasks}/{localSubtasks.length} ({subtaskPct}%)
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {localSubtasks.length > 0 && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskPct}%` }}
                  />
                </div>
              )}

              {/* Subtask list */}
              <div className="space-y-1.5">
                {localSubtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#0c121e] border border-[#1e293b] hover:border-slate-700 transition group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id, st.completed)}
                        disabled={isViewer}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span
                        className={`text-sm ${
                          st.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    {!isViewer && (
                      <button
                        onClick={() => handleDeleteSubtask(st.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add subtask creator */}
              {!isViewer && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    placeholder="+ Add a subtask..."
                    className="flex-1 bg-[#090d16] border border-[#263348] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Issue Links / Relationships Block */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Issue Links</span>
                </div>
                {!isViewer && (
                  <button
                    onClick={() => setIsAddingLink(!isAddingLink)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {isAddingLink ? 'Cancel' : '+ Link Issue'}
                  </button>
                )}
              </div>

              {/* Link Creator Form */}
              {isAddingLink && (
                <div className="mb-4 p-3 rounded-lg bg-[#090d16] border border-[#263348] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={linkType}
                      onChange={(e) => setLinkType(e.target.value as EnterpriseLinkType)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="BLOCKS">blocks</option>
                      <option value="IS_BLOCKED_BY">is blocked by</option>
                      <option value="RELATES_TO">relates to</option>
                      <option value="DUPLICATES">duplicates</option>
                    </select>

                    <input
                      type="text"
                      value={linkTarget}
                      onChange={(e) => setLinkTarget(e.target.value)}
                      placeholder="Target Key (e.g. APEX-102)"
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  {linkError && <p className="text-xs text-rose-400">{linkError}</p>}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleAddLink}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Create Link
                    </button>
                  </div>
                </div>
              )}

              {/* Render Linked Issues */}
              <div className="space-y-2">
                {(issue.links || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No linked issues.</p>
                ) : (
                  (issue.links || []).map((l) => {
                    const isSource = l.sourceIssueId === issue.key;
                    const otherKey = isSource ? l.targetIssueId : l.sourceIssueId;
                    const rawLType = (l.linkType || (l as any).relationType || 'RELATES_TO').toUpperCase();
                    const displayLabel = isSource
                      ? LINK_LABELS[rawLType] || rawLType
                      : rawLType === 'BLOCKS'
                      ? 'is blocked by'
                      : rawLType === 'IS_BLOCKED_BY'
                      ? 'blocks'
                      : LINK_LABELS[rawLType] || rawLType;

                    const targetFull = allIssues.find((i) => i.key === otherKey);

                    return (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#0c121e] border border-[#1e293b] text-xs"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-400 font-medium">{displayLabel}</span>
                          <button
                            onClick={() => onNavigateIssue && onNavigateIssue(otherKey)}
                            className="font-mono font-bold text-blue-400 hover:underline"
                          >
                            {otherKey}
                          </button>
                          {targetFull && (
                            <>
                              <span className="text-slate-300 truncate max-w-xs">{targetFull.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                                {targetFull.status}
                              </span>
                            </>
                          )}
                        </div>

                        {!isViewer && (
                          <button
                            onClick={() => handleRemoveLink(l.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove Link"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Development / Git Panel */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Development</span>
                </div>
                {!isViewer && (
                  <button
                    onClick={() => setIsAddingGit(!isAddingGit)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    {isAddingGit ? 'Cancel' : '+ Link Git Ref'}
                  </button>
                )}
              </div>

              {/* Add Git Link Modal / Form */}
              {isAddingGit && (
                <div className="mb-4 p-3 rounded-lg bg-[#090d16] border border-[#263348] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={gitRefType}
                      onChange={(e) => setGitRefType(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                    >
                      <option value="BRANCH">Branch</option>
                      <option value="PULL_REQUEST">Pull Request</option>
                      <option value="COMMIT">Commit</option>
                    </select>

                    <input
                      type="text"
                      value={gitRefName}
                      onChange={(e) => setGitRefName(e.target.value)}
                      placeholder={gitRefType === 'BRANCH' ? 'feat/apex-101-upgrade' : gitRefType === 'PULL_REQUEST' ? '#42 PR Title' : 'a1b2c3d'}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    />

                    <input
                      type="text"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleAddGitRef}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Link Reference
                    </button>
                  </div>
                </div>
              )}

              {/* Git links list */}
              <div className="space-y-2">
                {(issue.gitLinks || []).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No branches, pull requests, or commits linked yet.</p>
                ) : (
                  (issue.gitLinks || []).map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#0c121e] border border-[#1e293b] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {g.refType === 'BRANCH' ? (
                          <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                        ) : g.refType === 'PULL_REQUEST' ? (
                          <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <GitCommit className="w-3.5 h-3.5 text-purple-400" />
                        )}
                        <a
                          href={g.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-slate-200 hover:text-blue-400 flex items-center gap-1 hover:underline"
                        >
                          {g.refName}
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            g.status === 'MERGED'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : g.status === 'CLOSED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {g.status || 'OPEN'}
                        </span>
                      </div>

                      {!isViewer && (
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              await unlinkGitRefAction(g.id);
                              showToast('Git reference removed');
                            });
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Streams Tabs: Comments, History (Audit Log), Work Log */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-4">
              <div className="flex items-center gap-4 border-b border-[#263348] pb-2 mb-4">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition border-b-2 ${
                    activeTab === 'comments'
                      ? 'text-blue-400 border-blue-500'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Comments ({issue.comments?.length ?? 0})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition border-b-2 ${
                    activeTab === 'history'
                      ? 'text-blue-400 border-blue-500'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  History / Audit ({issue.auditLogs?.length || issue.history?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('worklog')}
                  className={`text-xs font-bold uppercase tracking-wider pb-1 transition border-b-2 ${
                    activeTab === 'worklog'
                      ? 'text-blue-400 border-blue-500'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  Work Log
                </button>
              </div>

              {/* Comments Tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Add comment box */}
                  {!isViewer && (
                    <div className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment... (Supports Markdown and @mentions)"
                        rows={3}
                        className="w-full bg-[#090d16] border border-[#263348] rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            if (!commentText.trim()) return;
                            onAddComment(commentText.trim());
                            setCommentText('');
                            showToast('Comment posted');
                          }}
                          disabled={!commentText.trim()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Post Comment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Comments list */}
                  <div className="space-y-3">
                    {(issue.comments || []).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No comments yet.</p>
                    ) : (
                      (issue.comments || []).map((c) => (
                        <div key={c.id} className="p-3 rounded-lg bg-[#0c121e] border border-[#1e293b] space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold text-slate-200">
                              {c.author?.name || 'Workspace User'}
                            </span>
                            <span className="font-mono text-[10px]">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="prose prose-invert prose-xs text-slate-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* History / Audit Log Tab */}
              {activeTab === 'history' && (
                <div className="space-y-2">
                  {(issue.auditLogs && issue.auditLogs.length > 0) ? (
                    issue.auditLogs.map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-lg bg-[#0c121e] border border-[#1e293b] text-xs flex items-start justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">{a.fieldChanged}</span>
                          <span className="text-slate-400 ml-1.5">
                            {a.oldValue ? `from "${a.oldValue}"` : ''} to <strong className="text-blue-400">"{a.newValue}"</strong>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (issue.history && issue.history.length > 0) ? (
                    issue.history.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-lg bg-[#0c121e] border border-[#1e293b] text-xs flex items-start justify-between"
                      >
                        <div>
                          <span className="text-slate-300 font-medium">{h.action}</span>
                          {h.field && (
                            <span className="text-slate-400 ml-1.5">
                              ({h.field}: {h.fromValue} &rarr; {h.toValue})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(h.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No audit history recorded.</p>
                  )}
                </div>
              )}

              {/* Work Log Tab */}
              {activeTab === 'worklog' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0c121e] border border-[#1e293b]">
                    <div>
                      <span className="text-xs text-slate-400 block uppercase">Estimate vs Remaining</span>
                      <span className="text-base font-bold text-white font-mono">
                        {issue.originalEstimateHours ?? 0}h original / {issue.remainingEstimateHours ?? 0}h remaining
                      </span>
                    </div>
                    {!isViewer && (
                      <button
                        onClick={() => setIsLogWorkOpen(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                      >
                        + Log Work
                      </button>
                    )}
                  </div>

                  {/* Log Work Modal Inline */}
                  {isLogWorkOpen && (
                    <div className="p-3.5 rounded-xl bg-[#090d16] border border-blue-500/40 space-y-3">
                      <span className="text-xs font-bold text-white block">Log Time Worked</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Time Spent (Hours)</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={logHoursSpent}
                            onChange={(e) => setLogHoursSpent(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Remaining Estimate (Hours)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={logRemainingHours}
                            onChange={(e) => setLogRemainingHours(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Work Description (Optional)</label>
                        <input
                          type="text"
                          value={logComment}
                          onChange={(e) => setLogComment(e.target.value)}
                          placeholder="What did you work on?"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsLogWorkOpen(false)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleLogWork}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Save Work Log
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Sidebar (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            {/* Status Selector with Workflow Rules */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
              <select
                value={issue.status}
                onChange={(e) => handleTransitionStatus(e.target.value)}
                disabled={isViewer}
                className="w-full bg-[#0c121e] border border-[#263348] rounded-lg p-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              >
                {swimlanes.length > 0 ? (
                  swimlanes.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  ['To Do', 'In Progress', 'In Review', 'Done'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Parent Epic Selector */}
            {resolvedType !== 'EPIC' && (
              <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Parent Epic</span>
                <select
                  value={issue.parentIssueId || ''}
                  onChange={(e) => onUpdateIssue({ parentIssueId: e.target.value || null })}
                  disabled={isViewer}
                  className="w-full bg-[#0c121e] border border-[#263348] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None (No Epic)</option>
                  {availableEpics.map((ep) => (
                    <option key={ep.key} value={ep.key}>
                      {ep.key} - {ep.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Issue Type Selector */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Issue Type</span>
              <select
                value={resolvedType}
                onChange={(e) => onUpdateIssue({ issueType: e.target.value })}
                disabled={isViewer}
                className="w-full bg-[#0c121e] border border-[#263348] rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                <option value="STORY">Story</option>
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
                <option value="SUBTASK">Subtask</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Assignee</span>
              <div className="flex items-center gap-2">
                {issue.assignee && <UserAvatar user={issue.assignee} size="sm" />}
                <select
                  value={issue.assigneeId || ''}
                  onChange={(e) => onUpdateIssue({ assigneeId: e.target.value || null })}
                  disabled={isViewer}
                  className="flex-1 bg-[#0c121e] border border-[#263348] rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Story Points */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Story Points</span>
              <input
                type="number"
                min="0"
                max="100"
                value={issue.storyPoints ?? 0}
                onChange={(e) => onUpdateIssue({ storyPoints: parseInt(e.target.value) || 0 })}
                disabled={isViewer}
                className="w-full bg-[#0c121e] border border-[#263348] rounded-lg p-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            {/* Priority */}
            <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Priority</span>
              <select
                value={issue.priority}
                onChange={(e) => onUpdateIssue({ priority: e.target.value as IssuePriority })}
                disabled={isViewer}
                className="w-full bg-[#0c121e] border border-[#263348] rounded-lg p-2 text-xs text-white focus:outline-none"
              >
                {['Critical', 'High', 'Medium', 'Low', 'Lowest'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Impediment Flag Button */}
            {!isViewer && (
              <div className="bg-[#111723] rounded-xl border border-[#263348] p-3.5">
                <button
                  onClick={() => {
                    startTransition(async () => {
                      const res = await toggleIssueFlag(issue.key);
                      if (res.success) {
                        showToast(res.flagged ? 'Flagged as impediment' : 'Impediment flag cleared');
                      }
                    });
                  }}
                  className={`w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold transition border ${
                    issue.isFlagged
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${issue.isFlagged ? 'fill-rose-400' : ''}`} />
                  {issue.isFlagged ? 'Clear Impediment Flag' : 'Flag as Impediment'}
                </button>
              </div>
            )}

            {/* Delete Issue Danger Zone */}
            {!isViewer && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${issue.key}?`)) {
                      onDelete();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Issue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
