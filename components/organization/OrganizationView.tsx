'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Building2,
  FolderKanban,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Lock,
  Kanban,
  Sparkles,
  Info,
  ChevronRight,
  UserPlus,
  RefreshCw,
  X,
  BadgeAlert,
} from 'lucide-react';
import { User, Project, UserRole } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  getAllOrganizationProjectsAction,
  getAllUserProjectAssignmentsAction,
  assignUserToProject,
  removeUserFromProject,
  OrganizationProjectSummary,
  UserProjectAssignment,
} from '@/app/actions/projects';
import { approveUser, updateUserRole } from '@/app/actions/team';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';

interface OrganizationViewProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenCreateProject?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export function OrganizationView({
  currentUser,
  users: initialUsers,
  projects: initialProjects,
  onSelectProject,
  onNavigateTab,
  onOpenCreateProject,
  onShowToast,
}: OrganizationViewProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'governance'>('projects');
  const [orgProjects, setOrgProjects] = useState<OrganizationProjectSummary[]>([]);
  const [userAssignments, setUserAssignments] = useState<Record<string, UserProjectAssignment[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<OrganizationProjectSummary | null>(null);

  // Quick Assign Modal state
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [selectedAssignProjectId, setSelectedAssignProjectId] = useState<string>('');
  const [selectedAssignRole, setSelectedAssignRole] = useState<'MEMBER' | 'PROJECT_MANAGER' | 'VIEWER'>('MEMBER');

  const [isPending, startTransition] = useTransition();

  const isAdmin = currentUser.role === 'Admin';

  const loadOrgData = async () => {
    try {
      setLoading(true);
      const [projectsData, assignmentsData] = await Promise.all([
        getAllOrganizationProjectsAction(),
        getAllUserProjectAssignmentsAction(),
      ]);
      setOrgProjects(projectsData.length > 0 ? projectsData : initialProjects.map((p) => ({ ...p, memberCount: 1 })));
      setUserAssignments(assignmentsData);
    } catch (err) {
      console.error('Failed to load organization data:', err);
      setOrgProjects(initialProjects.map((p) => ({ ...p, memberCount: 1 })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();
  }, [initialProjects]);

  const filteredProjects = orgProjects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
  });

  const filteredUsers = initialUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department || '').toLowerCase().includes(q);
  });

  const unassignedUsersCount = initialUsers.filter((u) => {
    const assigned = userAssignments[u.id] || [];
    return assigned.length === 0 && u.role !== 'Admin';
  }).length;

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningUser || !selectedAssignProjectId) return;

    startTransition(async () => {
      const res = await assignUserToProject({
        projectId: selectedAssignProjectId,
        targetUserId: assigningUser.id,
        projectRole: selectedAssignRole,
      });

      if (res.success) {
        onShowToast?.(res.message || 'Assigned user to project', 'success');
        setAssigningUser(null);
        setSelectedAssignProjectId('');
        await loadOrgData();
      } else {
        onShowToast?.(res.error || 'Failed to assign user', 'error');
      }
    });
  };

  const handleApproveUser = (userId: string, role: UserRole = 'Member') => {
    startTransition(async () => {
      const res = await approveUser(userId, role);
      if (res.success) {
        onShowToast?.(res.message || 'User approved', 'success');
        await loadOrgData();
      } else {
        onShowToast?.(res.error || 'Failed to approve user', 'error');
      }
    });
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        onShowToast?.(res.message || 'Role updated', 'success');
        await loadOrgData();
      } else {
        onShowToast?.(res.error || 'Failed to update role', 'error');
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Organization Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-widest">
                Organization Hub & Governance
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                ENTERPRISE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Kynov Enterprise Organization
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Multi-team workspace management with Linear-style zero-trust project scoping. Manage team projects, configure granular access roles, and monitor cross-project memberships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenCreateProject && (
              <button
                onClick={onOpenCreateProject}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-98"
              >
                <Plus className="w-4 h-4" /> New Team Project
              </button>
            )}
            <button
              onClick={() => onNavigateTab('team')}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Users className="w-4 h-4" /> Team Directory
            </button>
          </div>
        </div>

        {/* Executive KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80 text-left">
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
              <span>Active Projects</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{orgProjects.length}</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Members</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">{initialUsers.length}</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security Scheme</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 mt-2 truncate">Project Scoped RBAC</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/60">
            <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <BadgeAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Unassigned Seats</span>
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1">{unassignedUsersCount}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Projects & Access Matrix</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono">
              {orgProjects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'members'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Member Project Roster</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-mono">
              {initialUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('governance')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
              activeTab === 'governance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>RBAC Policy & Schemes</span>
          </button>
        </div>

        {activeTab !== 'governance' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'projects' ? 'Filter projects...' : 'Filter members...'}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 transition"
            />
          </div>
        )}
      </div>

      {/* TAB 1: PROJECTS & ACCESS MATRIX */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const leadUser = initialUsers.find((u) => u.id === project.leadId);
              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Project Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                          {project.key}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {project.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {project.category || 'Software'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {project.memberCount} {project.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {project.description || 'Enterprise project workspace for tracking tasks and workflows.'}
                    </p>

                    {/* Lead Information */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-4">
                      {leadUser ? (
                        <>
                          <UserAvatar user={leadUser} size="xs" />
                          <div className="text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="text-slate-400">Lead: </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{leadUser.name}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Unassigned Lead
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => setSelectedProjectForMembers(project)}
                      className="w-full flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-semibold transition"
                    >
                      <Users className="w-3.5 h-3.5" /> Manage Members
                    </button>

                    <button
                      onClick={() => {
                        onSelectProject(project.id);
                        onNavigateTab('board');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 py-2 rounded-xl text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60 transition"
                    >
                      <Kanban className="w-3.5 h-3.5" /> View Board
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MEMBER PROJECT ROSTER */}
      {activeTab === 'members' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Organization Team Roster</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shows workspace tier roles and exact project assignments. Newly registered users without project assignments are tagged.
              </p>
            </div>
            <button
              onClick={loadOrgData}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Refresh Roster"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Org Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Assigned Projects</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.map((user) => {
                  const assignments = userAssignments[user.id] || [];
                  const isUnassigned = assignments.length === 0 && user.role !== 'Admin';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      {/* Member Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="sm" />
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {user.name}
                              {user.id === currentUser.id && (
                                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {user.email} • {user.department || 'Engineering'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization Role */}
                      <td className="py-3.5 px-4">
                        {isAdmin && user.id !== currentUser.id ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2 py-1 font-semibold focus:outline-hidden"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Member">Member</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                              user.role === 'Admin'
                                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                                : user.role === 'Member'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {user.role === 'Admin' && <Shield className="w-3 h-3" />}
                            {user.role}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-md transition"
                              >
                                Approve
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Project Assignments */}
                      <td className="py-3.5 px-4">
                        {user.role === 'Admin' ? (
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md">
                            Global Bypass (All Projects)
                          </span>
                        ) : assignments.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {assignments.map((a) => (
                              <span
                                key={a.projectId}
                                className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                                title={`${a.projectName} (${a.projectRole})`}
                              >
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{a.projectKey}</span>
                                <span className="text-slate-400 text-[9px] uppercase">({a.projectRole})</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                            <Info className="w-3 h-3" /> Unassigned (Zero Project Access)
                          </span>
                        )}
                      </td>

                      {/* Quick Assign Action */}
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setAssigningUser(user);
                              setSelectedAssignProjectId(orgProjects[0]?.id || '');
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl transition"
                          >
                            <UserPlus className="w-3 h-3" /> Assign Project
                          </button>
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

      {/* TAB 3: RBAC POLICY & SCHEMES */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Workspace Tier (Organization Level)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Organization membership determines access to workspace-level utilities, team directory, and global governance settings.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="font-bold text-purple-600 dark:text-purple-400">Admin</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Full super-admin access. Global bypass across all organization projects. Manages team invitations, seat approvals, and project creation.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="font-bold text-blue-600 dark:text-blue-400">Member</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Standard team member seat. Can view workspace directory and participate actively in all projects they are assigned to.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="font-bold text-slate-600 dark:text-slate-400">Viewer</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Default seat for newly registered users. Read-only observation. Zero project exposure until explicitly granted project membership.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <FolderKanban className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Project Tier (Per-Project RBAC)
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Linear & Jira zero-trust model: Access to issues, boards, backlogs, and sprints is strictly enforced per project record in <code className="text-indigo-500">project_members</code>.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="font-bold text-indigo-600 dark:text-indigo-400">PROJECT_MANAGER</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Project Lead. Can assign members to the project, manage board swimlanes, start/complete sprints, and edit project metadata.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="font-bold text-emerald-600 dark:text-emerald-400">MEMBER</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Active contributor. Can create and transition issues, comment, estimate story points, link git pull requests, and manage subtasks.
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="font-bold text-slate-500 dark:text-slate-400">VIEWER</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Stakeholder seat. Can inspect issues, sprint progress, and reports within this project, without mutation rights.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Project Members Modal */}
      {selectedProjectForMembers && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedProjectForMembers(null);
                loadOrgData();
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                {selectedProjectForMembers.key}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Project Permissions: {selectedProjectForMembers.name}
              </h2>
            </div>

            <ProjectMembersPanel
              projectId={selectedProjectForMembers.id}
              currentUser={currentUser}
              allUsers={initialUsers}
              onShowToast={onShowToast}
            />
          </div>
        </div>
      )}

      {/* Quick Assign Project Popover/Modal */}
      {assigningUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
            <button
              onClick={() => setAssigningUser(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Assign Project to {assigningUser.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Select the team project and project-level role to grant this user access.
            </p>

            <form onSubmit={handleQuickAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Project
                </label>
                <select
                  value={selectedAssignProjectId}
                  onChange={(e) => setSelectedAssignProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  required
                >
                  {orgProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.key}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Role
                </label>
                <select
                  value={selectedAssignRole}
                  onChange={(e) => setSelectedAssignRole(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="MEMBER">Member (Create and edit issues)</option>
                  <option value="PROJECT_MANAGER">Project Manager (Manage project & members)</option>
                  <option value="VIEWER">Viewer (Read-only on project board)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningUser(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !selectedAssignProjectId}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isPending ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
