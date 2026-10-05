'use client';

import React from 'react';
import { Shield, Plus, Lock, Trash2, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';

interface TeamManagementViewProps {
  users: User[];
  currentUser: User;
  isAdmin: boolean;
  onAddUser: () => void;
  onApproveUser: (userId: string) => void;
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
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Admin Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Team Roster & RBAC Permissions
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage organization members, approve pending sign-ins, designate administrative rights, or adjust read-only viewer privileges.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={onAddUser}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Team Member
          </button>
        ) : (
          <div className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>
              Read-only: Only Admin ({users.find((u) => u.role === 'Admin')?.name || 'Admin'}) can modify team seats.
            </span>
          </div>
        )}
      </div>

      {/* Team Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
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
                            onClick={() => onApproveUser(member.id)}
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
  );
}
