'use client';
import React, { useState, useEffect, useTransition } from 'react';
import {
  FolderKanban,
  Plus,
  X,
  Edit2,
  Archive,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Shield,
  Layers,
  Users,
} from 'lucide-react';
import { Project, User } from '@/lib/types';
import { createProject, updateProject, deleteProject, getUserProjectsAction } from '@/app/actions/projects';
import { ProjectMembersPanel } from '@/components/projects/ProjectMembersPanel';

interface ProjectsModalProps {
  projects: Project[];
  activeProjectId: string;
  users: User[];
  currentUser?: User;
  isViewer: boolean;
  onSelectProject: (projectId: string) => void;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export function ProjectsModal({
  projects: initialProjects,
  activeProjectId,
  users,
  currentUser,
  isViewer,
  onSelectProject,
  onClose,
  onShowToast,
}: ProjectsModalProps) {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'members'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);

  // Load dynamically accessible projects
  useEffect(() => {
    getUserProjectsAction().then((accessible) => {
      if (accessible && accessible.length > 0) {
        setProjectsList(accessible);
      }
    }).catch(console.error);
  }, []);

  // Form fields
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Software');
  const [leadId, setLeadId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenCreate = () => {
    setKey('');
    setName('');
    setDescription('');
    setCategory('Software');
    setLeadId(users[0]?.id || '');
    setError(null);
    setView('create');
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setCategory(proj.category || 'Software');
    setLeadId(proj.leadId || '');
    setError(null);
    setView('edit');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    setError(null);
    startTransition(async () => {
      const res = await createProject({
        key,
        name,
        description,
        category,
        leadId: leadId || undefined,
      });

      if (res.success && res.projectId) {
        onShowToast(res.message || 'Project created');
        onSelectProject(res.projectId);
        setView('list');
      } else {
        setError(res.error || 'Failed to create project');
      }
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || isViewer) return;

    setError(null);
    startTransition(async () => {
      const res = await updateProject(editingProject.id, {
        name,
        description,
        category,
        leadId: leadId || undefined,
      });

      if (res.success) {
        onShowToast('Project updated');
        setView('list');
      } else {
        setError(res.error || 'Failed to update project');
      }
    });
  };

  const handleArchive = (proj: Project) => {
    if (isViewer) return;
    if (projectsList.length <= 1) {
      onShowToast('Cannot archive the only project in the workspace.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await deleteProject(proj.id);
      if (res.success) {
        onShowToast(res.message || 'Project archived');
        if (activeProjectId === proj.id) {
          const fallback = projectsList.find((p) => p.id !== proj.id);
          if (fallback) onSelectProject(fallback.id);
        }
      } else {
        onShowToast(res.error || 'Failed to archive project', 'error');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Projects Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize distinct workspaces, track multiple initiatives, and switch boards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {view === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Projects ({projectsList.length})
                </span>
                {!isViewer && (
                  <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Project
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {projectsList.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  const lead = users.find((u) => u.id === proj.leadId);

                  return (
                    <div
                      key={proj.id}
                      className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider font-mono flex-shrink-0 shadow-sm">
                          {proj.key}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {proj.name}
                            </h3>
                            {isActive && (
                              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                                Active Workspace
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {proj.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                            <span>Category: {proj.category || 'Software'}</span>
                            {lead && <span>• Lead: {lead.name}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedProjectForMembers(proj);
                            setView('members');
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                          title="View and Manage Project Members"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Members</span>
                        </button>

                        {!isActive ? (
                          <button
                            onClick={() => {
                              onSelectProject(proj.id);
                              onClose();
                            }}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                          >
                            Switch <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Selected
                          </span>
                        )}

                        {!isViewer && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(proj)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Edit Project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(proj)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                              title="Archive Project"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === 'members' && selectedProjectForMembers && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Project Members:</span>
                    <span className="font-mono text-blue-500">[{selectedProjectForMembers.key}]</span>
                    <span>{selectedProjectForMembers.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Assign workspace users or managers to grant access to this project.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  ← Back to Projects
                </button>
              </div>

              <ProjectMembersPanel
                projectId={selectedProjectForMembers.id}
                currentUser={currentUser || users[0]}
                allUsers={users}
                onShowToast={onShowToast}
              />
            </div>
          )}

          {(view === 'create' || view === 'edit') && (
            <form onSubmit={view === 'create' ? handleCreate : handleUpdate} className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {view === 'create' ? 'Create New Project' : `Edit Project: ${editingProject?.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ← Back to Projects
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  {error}
                </div>
              )}

              {view === 'create' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Key * (e.g. APEX, CORE, MOBILE)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. CORE"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase())}
                    className="w-full text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used as the ticket prefix for all issues in this board (e.g., CORE-101).
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile Application V2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline the scope, team objectives, and goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Software">Software</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Lead
                  </label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : view === 'create' ? 'Create Project & Swimlanes' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
