'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { User } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  getProjectMembersAction,
  assignUserToProject,
  removeUserFromProject,
  updateProjectMemberRoleAction,
  canManageProjectMembersAction,
} from '@/app/actions/projects';

export interface ProjectMemberRow {
  id: string;
  projectId: string;
  userId: string;
  projectRole: string;
  userName: string;
  userEmail: string;
  userRole: string;
  avatarUrl: string | null;
  department: string | null;
}

interface ProjectMembersPanelProps {
  projectId: string;
  currentUser: User;
  allUsers?: User[];
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export function ProjectMembersPanel({
  projectId,
  currentUser,
  allUsers = [],
  onShowToast,
}: ProjectMembersPanelProps) {
  const [members, setMembers] = useState<ProjectMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'PROJECT_MANAGER' | 'VIEWER'>('MEMBER');
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersData, allowed] = await Promise.all([
        getProjectMembersAction(projectId),
        canManageProjectMembersAction(projectId),
      ]);
      setMembers(membersData);
      setCanManage(allowed);
    } catch (err) {
      console.error('Failed to load project members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  // Workspace users available to add
  const availableUsers = allUsers.filter(
    (u) => !members.some((m) => m.userId === u.id) && u.status === 'APPROVED'
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !canManage) return;

    setActionError(null);
    startTransition(async () => {
      const res = await assignUserToProject({
        projectId,
        targetUserId: selectedUserId,
        projectRole: selectedRole,
      });

      if (res.success) {
        onShowToast?.(res.message || 'User added to project', 'success');
        setSelectedUserId('');
        setSelectedRole('MEMBER');
        await loadData();
      } else {
        setActionError(res.error || 'Failed to assign user');
        onShowToast?.(res.error || 'Failed to assign user', 'error');
      }
    });
  };

  const handleRemoveMember = (targetUserId: string, targetName: string) => {
    if (!canManage) return;

    setActionError(null);
    startTransition(async () => {
      const res = await removeUserFromProject({
        projectId,
        targetUserId,
      });

      if (res.success) {
        onShowToast?.(`Removed ${targetName} from project`, 'success');
        await loadData();
      } else {
        setActionError(res.error || 'Failed to remove user');
        onShowToast?.(res.error || 'Failed to remove user', 'error');
      }
    });
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!canManage || updatingUserId === targetUserId) return;

    const previousMembers = [...members];
    // Optimistic UI update
    setMembers((prev) =>
      prev.map((m) => (m.userId === targetUserId ? { ...m, projectRole: newRole } : m))
    );
    setUpdatingUserId(targetUserId);

    try {
      const res = await updateProjectMemberRoleAction({
        projectId,
        targetUserId,
        newRole,
      });

      if (res.success) {
        onShowToast?.(res.message || 'Project role updated successfully', 'success');
      } else {
        setActionError(res.error || 'Failed to update member role');
        onShowToast?.(res.error || 'Failed to update member role', 'error');
        // Revert on failure
        setMembers(previousMembers);
      }
    } catch {
      onShowToast?.('Failed to update member role', 'error');
      setMembers(previousMembers);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Access Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Members ({members.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage authorized access and roles for this project.
          </p>
        </div>

        {canManage ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authorized Manager</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-[11px] font-medium self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5" />
            <span>Read-Only View</span>
          </div>
        )}
      </div>

      {/* Super Admin & CTO Visibility Clarification Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-blue-950 dark:text-blue-200">
            Workspace vs. Project Roles Clarification
          </p>
          <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
            <strong>Workspace Super Admins</strong> and <strong>CTOs</strong> possess global bypass access across all workspace projects by default and do not require manual assignment. Explicit assignment is only needed when designating specific project-level responsibilities (such as Project Manager).
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Conditionally Render Add Member Form ONLY for Admin, CTO, or Project Manager */}
      {canManage && (
        <form
          onSubmit={handleAddMember}
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <UserPlus className="w-4 h-4 text-blue-500" />
            <span>Add Member to Project</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">Select a workspace user...</option>
                {availableUsers.map((u) => {
                  const isGlobalBypass =
                    u.role === 'Admin' ||
                    (u as any).designation?.toUpperCase() === 'CTO' ||
                    u.department?.toUpperCase() === 'CTO';
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role}
                      {isGlobalBypass ? ' (Global Access: Admin/CTO)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'MEMBER' | 'PROJECT_MANAGER' | 'VIEWER')}
                className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="MEMBER">Member</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isPending || !selectedUserId}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Assign User</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Members List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs">Loading assigned members...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="py-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No explicit members assigned yet.
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Workspace Admins and CTOs still have global bypass access.
            {canManage && ' Use the form above to grant explicit access to team members.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
          {members.map((member) => {
            const isSelf = member.userId === currentUser.id;
            const isManager = member.projectRole === 'PROJECT_MANAGER';
            const isViewerRole = member.projectRole === 'VIEWER';
            const isUpdating = updatingUserId === member.userId;

            const isWorkspaceAdmin = member.userRole === 'Admin' || member.userRole === 'ADMIN';
            const isCTO =
              member.department?.toUpperCase() === 'CTO' ||
              (member as any).designation?.toUpperCase() === 'CTO';

            // Role styling classes
            const roleColorClasses = isManager
              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80'
              : isViewerRole
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80';

            return (
              <div
                key={member.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    user={{
                      name: member.userName,
                      avatarUrl: member.avatarUrl,
                      email: member.userEmail,
                    }}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {member.userName}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                          You
                        </span>
                      )}
                      {isWorkspaceAdmin && (
                        <span
                          className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-semibold"
                          title="Workspace Admin: Global bypass access"
                        >
                          Workspace Admin
                        </span>
                      )}
                      {isCTO && (
                        <span
                          className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded font-semibold"
                          title="CTO: Global bypass access"
                        >
                          CTO
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {member.userEmail}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {/* Inline Interactive Role Dropdown */}
                  {isUpdating ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                      <span className="text-[11px] font-medium">Updating...</span>
                    </div>
                  ) : canManage ? (
                    <div
                      className={`relative flex items-center rounded-xl border px-2.5 py-1 text-xs font-semibold transition shadow-2xs ${roleColorClasses}`}
                    >
                      <span className="mr-1.5 flex items-center pointer-events-none">
                        {isManager ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        ) : isViewerRole ? (
                          <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </span>
                      <select
                        value={member.projectRole}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                        disabled={!canManage || isUpdating}
                        className="bg-transparent font-semibold text-xs focus:outline-none cursor-pointer pr-4 appearance-none"
                        aria-label={`Project role for ${member.userName}`}
                      >
                        <option
                          value="PROJECT_MANAGER"
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                        >
                          Project Manager
                        </option>
                        <option
                          value="MEMBER"
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                        >
                          Member
                        </option>
                        <option
                          value="VIEWER"
                          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
                        >
                          Viewer
                        </option>
                      </select>
                      <ChevronDown className="w-3 h-3 ml-1 pointer-events-none opacity-60 absolute right-2" />
                    </div>
                  ) : (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${roleColorClasses}`}
                    >
                      {isManager ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      ) : isViewerRole ? (
                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                      )}
                      <span>
                        {isManager
                          ? 'Project Manager'
                          : isViewerRole
                          ? 'Viewer'
                          : 'Member'}
                      </span>
                    </div>
                  )}

                  {/* Conditionally show Remove Member control ONLY if authorized */}
                  {canManage && (
                    <button
                      onClick={() => handleRemoveMember(member.userId, member.userName)}
                      disabled={isPending || isUpdating}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition disabled:opacity-40 cursor-pointer"
                      title={`Remove ${member.userName} from project`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
