'use client';

import React, { useState } from 'react';
import {
  Shield,
  Plus,
  Lock,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  UserCheck,
} from 'lucide-react';
import { User, UserRole } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TeamManagementViewProps {
  users: User[];
  currentUser: User;
  isAdmin: boolean;
  onAddUser: () => void;
  onApproveUser: (userId: string, assignedRole?: UserRole) => void;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onDeleteUser: (userId: string) => void;
}

export function TeamManagementView({
  users,
  currentUser,
  isAdmin,
  onAddUser,
  onApproveUser,
  onUpdateRole,
  onDeleteUser,
}: TeamManagementViewProps) {
  const [tab, setTab] = useState<'all' | 'pending'>('all');
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});

  const pendingUsers = users.filter((u) => u.status === 'PENDING');
  const approvedUsers = users.filter((u) => u.status !== 'PENDING');

  const getPendingRole = (userId: string, defaultRole: UserRole): UserRole => {
    return selectedRoles[userId] || defaultRole || 'Member';
  };

  const handleRoleSelection = (userId: string, role: UserRole) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Admin Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Team Roster & RBAC Permissions
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage organization members, verify and approve pending sign-ups, configure administrator controls, or assign read-only viewer seats.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={onAddUser}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition flex-shrink-0 active:scale-98"
          >
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        ) : (
          <div className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>
              Read-only: Only Admin ({users.find((u) => u.role === 'Admin')?.name || 'Admin'}) can modify seats.
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition -mb-px ${
              tab === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Team Roster</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              {approvedUsers.length}
            </span>
          </button>

          <button
            onClick={() => setTab('pending')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition -mb-px ${
              tab === 'pending'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals</span>
            {pendingUsers.length > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold animate-pulse font-mono">
                {pendingUsers.length}
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                0
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {tab === 'pending' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          {pendingUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                No Pending Approvals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All registered accounts have been reviewed. When new team members sign up, their access requests will appear here for Admin activation.
              </p>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>
                  <strong>{pendingUsers.length} account{pendingUsers.length === 1 ? '' : 's'}</strong> waiting for administrator authorization.
                </span>
                <span className="text-[11px] font-mono">RBAC Security Gate</span>
              </div>

              {/* Mobile Card List (< md) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/60 p-2 space-y-2">
                {pendingUsers.map((member) => {
                  const assignedRole = getPendingRole(member.id, member.role);
                  return (
                    <div key={member.id} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-750 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar user={member} size="md" />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                              {member.name}
                            </span>
                            <span className="text-xs text-slate-500 font-mono block truncate">
                              {member.email}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold flex-shrink-0 animate-pulse">
                          PENDING
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-black/5 dark:border-white/5">
                        <span className="text-slate-400 text-[11px]">Department:</span>
                        <span className="font-medium">{member.department || 'Engineering'}</span>
                      </div>

                      {isAdmin && (
                        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-400">Role:</span>
                            <select
                              value={assignedRole}
                              style={{ colorScheme: 'dark' }}
                              onChange={(e) =>
                                handleRoleSelection(member.id, e.target.value as UserRole)
                              }
                              className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                            >
                              <option value="Member">Member (Read/Write)</option>
                              <option value="Viewer">Viewer (Read-Only)</option>
                              <option value="Admin">Admin (Full Control)</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => onApproveUser(member.id, assignedRole)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                            <button
                              onClick={() => onDeleteUser(member.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-semibold transition"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      <th className="py-3 px-6">Applicant</th>
                      <th className="py-3 px-6">Department</th>
                      <th className="py-3 px-6">Assign Initial Role</th>
                      <th className="py-3 px-6 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                    {pendingUsers.map((member) => {
                      const assignedRole = getPendingRole(member.id, member.role);

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <UserAvatar user={member} size="md" />
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{member.name}</span>
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                    PENDING
                                  </span>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                  {member.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                            {member.department || 'Engineering'}
                          </td>

                          <td className="py-4 px-6">
                            {isAdmin ? (
                              <select
                                value={assignedRole}
                                style={{ colorScheme: 'dark' }}
                                onChange={(e) =>
                                  handleRoleSelection(member.id, e.target.value as UserRole)
                                }
                                className="text-xs bg-slate-50 dark:bg-slate-750 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                              >
                                <option value="Member">Member (Read / Write)</option>
                                <option value="Viewer">Viewer (Read-Only)</option>
                                <option value="Admin">Admin (Full Control)</option>
                              </select>
                            ) : (
                              <span className="text-xs font-mono">{member.role}</span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-right">
                            {isAdmin && (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => onApproveUser(member.id, assignedRole)}
                                  className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold shadow-sm transition active:scale-95"
                                  title="Approve account and activate seat"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => onDeleteUser(member.id)}
                                  className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 px-2.5 py-1.5 rounded-lg font-medium transition"
                                  title="Reject and decline registration"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Full Team Roster */}
      {tab === 'all' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/60 p-2.5 space-y-2.5">
            {users.map((member) => {
              const isSelf = member.id === currentUser.id;
              const isPending = member.status === 'PENDING';

              return (
                <div
                  key={member.id}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-750 flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={member} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {member.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono font-semibold flex-shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono block truncate mt-0.5">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-black/5 dark:border-white/5">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-mono">Department</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate block">
                        {member.department || 'Engineering'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-mono">Role</span>
                      {isAdmin && !isSelf ? (
                        <select
                          value={member.role}
                          style={{ colorScheme: 'dark' }}
                          onChange={(e) =>
                            onUpdateRole(member.id, e.target.value as UserRole)
                          }
                          className="mt-0.5 w-full text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-block mt-0.5 text-[11px] px-2 py-0.5 rounded font-semibold font-mono ${
                            member.role === 'Admin'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : member.role === 'Member'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (isPending || !isSelf) && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                      {isPending && (
                        <button
                          onClick={() => onApproveUser(member.id, member.role)}
                          className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-semibold shadow-sm transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {!isSelf && (
                        <button
                          onClick={() => onDeleteUser(member.id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="py-3 px-6">User & Profile</th>
                  <th className="py-3 px-6">Department</th>
                  <th className="py-3 px-6">Role & Permissions</th>
                  <th className="py-3 px-6">Status</th>
                  {isAdmin && <th className="py-3 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                {users.map((member) => {
                  const isSelf = member.id === currentUser.id;
                  const isPending = member.status === 'PENDING';

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-750 transition"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={member} size="md" />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{member.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-mono">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-300">
                        {member.department || 'Engineering'}
                      </td>

                      <td className="py-4 px-6">
                        {isAdmin && !isSelf ? (
                          <select
                            value={member.role}
                            style={{ colorScheme: 'dark' }}
                            onChange={(e) =>
                              onUpdateRole(member.id, e.target.value as UserRole)
                            }
                            className="text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2.5 py-1 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                          >
                            <option value="Admin">Admin (Full Control)</option>
                            <option value="Member">Member (Read/Write)</option>
                            <option value="Viewer">Viewer (Read-Only)</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold font-mono ${
                              member.role === 'Admin'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : member.role === 'Member'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {member.role}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-300 dark:border-amber-800">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {member.status}
                          </span>
                        )}
                      </td>

                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isPending && (
                              <button
                                onClick={() => onApproveUser(member.id, member.role)}
                                className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md font-semibold shadow-sm transition"
                                title="Approve access to ApexTrack"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                            )}

                            {!isSelf && (
                              <button
                                onClick={() => onDeleteUser(member.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                title="Remove user from workspace"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
