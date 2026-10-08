'use client';

import React, { useState, useMemo, useOptimistic, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FullIssue,
  FullDocument,
  WorkspaceMetrics,
  User,
  Sprint,
  UserRole,
  Project,
  Swimlane,
} from '@/lib/types';
import { Sidebar } from '@/components/shell/Sidebar';
import { Header } from '@/components/shell/Header';
import { BoardFilters, BoardFiltersState, evaluateJqlLite } from '@/components/board/BoardFilters';
import { KanbanBoardView } from '@/components/board/KanbanBoard';
import { BacklogView } from '@/components/backlog/BacklogView';
import { DocumentsView } from '@/components/docs/DocumentsView';
import { DocumentReaderModal } from '@/components/docs/DocumentReaderModal';
import { CreateDocModal } from '@/components/docs/CreateDocModal';
import { TeamManagementView } from '@/components/team/TeamManagement';
import { AddUserModal } from '@/components/team/AddUserModal';
import { MetricsReportView } from '@/components/metrics/MetricsReport';
import { IssueDetailDrawer } from '@/components/drawer/IssueDetailDrawer';
import { CreateIssueModal } from '@/components/issues/CreateIssueModal';
import { ProjectsModal } from '@/components/projects/ProjectsModal';
import { UserProfileModal } from '@/components/profile/UserProfileModal';
import { Toast, Notification } from '@/components/ui/Toast';

import {
  moveIssueStatus,
  createIssue,
  updateIssue,
  deleteIssue,
  addComment,
} from '@/app/actions/issues';
import {
  createSwimlane,
  updateSwimlane,
  deleteSwimlane,
} from '@/app/actions/swimlanes';
import {
  createDocument,
  updateDocument,
  deleteDocument,
} from '@/app/actions/documents';
import {
  inviteUser,
  approveUser,
  updateUserRole,
  removeUser,
  switchPersona,
  updateUserProfile,
} from '@/app/actions/team';

interface WorkspaceProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  swimlanes: Swimlane[];
  issues: FullIssue[];
  docs: FullDocument[];
  sprints: Sprint[];
  metrics: WorkspaceMetrics;
}

export function Workspace({
  currentUser,
  users: initialUsers,
  projects: initialProjects = [],
  swimlanes: initialSwimlanes = [],
  issues: initialIssues,
  docs: initialDocs,
  sprints,
  metrics: initialMetrics,
}: WorkspaceProps) {
  const [activeTab, setActiveTab] = useState<string>('board');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [activeProjectId, setActiveProjectId] = useState<string>(
    initialProjects[0]?.id || 'proj-apex'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [boardFilters, setBoardFilters] = useState<BoardFiltersState>({
    selectedTypes: [],
    selectedPriorities: [],
    selectedAssignee: 'ALL',
    selectedEpic: 'ALL',
    onlyMine: false,
    jqlQuery: '',
    isJqlMode: false,
  });

  // Modals & Drawers
  const [selectedIssueKey, setSelectedIssueKey] = useState<string | null>(null);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState<boolean>(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState<boolean>(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<FullDocument | null>(null);
  const [activeDocDetail, setActiveDocDetail] = useState<FullDocument | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const router = useRouter();
  const [, startTransition] = useTransition();

  // Multi-user SWR Polling (refreshes server state every 15 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  // Optimistic UI updates for issues drag-and-drop
  const [optimisticIssues, setOptimisticIssues] = useOptimistic(
    initialIssues,
    (state, update: { key: string; newStatus: string }) => {
      return state.map((issue) =>
        issue.key === update.key ? { ...issue, status: update.newStatus } : issue
      );
    }
  );

  // Optimistic UI updates for sprint settings
  const [optimisticSprints, setOptimisticSprints] = useOptimistic(
    sprints,
    (state, update: Sprint) => {
      return state.map((s) => (s.id === update.id ? update : s));
    }
  );

  const handleUpdateSprint = (updatedSprint: Sprint) => {
    startTransition(async () => {
      setOptimisticSprints(updatedSprint);
      showToast(`Sprint "${updatedSprint.name}" updated successfully`);
    });
  };

  const isAdmin = currentUser.role === 'Admin';
  const isViewer = currentUser.role === 'Viewer';
  const isPending = currentUser.status === 'PENDING';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3800);
  };

  // Active project swimlanes
  const activeSwimlanes = useMemo(() => {
    return initialSwimlanes.filter((s) => s.projectId === activeProjectId);
  }, [initialSwimlanes, activeProjectId]);

  // Filtered Issues scoped to active project with compound filters + JQL-lite
  const filteredIssues = useMemo(() => {
    return optimisticIssues.filter((issue) => {
      const matchesProject = !issue.projectId || issue.projectId === activeProjectId;
      if (!matchesProject) return false;

      // Header search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inText =
          issue.key.toLowerCase().includes(q) ||
          issue.title.toLowerCase().includes(q) ||
          issue.description?.toLowerCase().includes(q) ||
          issue.labels?.some((l) => l.toLowerCase().includes(q));
        if (!inText) return false;
      }

      // JQL-lite mode
      if (boardFilters.isJqlMode) {
        return evaluateJqlLite(issue, currentUser.id, boardFilters.jqlQuery);
      }

      // Compound filter evaluation
      if (boardFilters.selectedTypes.length > 0) {
        const issueT = (issue.issueType || issue.type || '').toLowerCase();
        const matchesType = boardFilters.selectedTypes.some(
          (t) => t.toLowerCase() === issueT
        );
        if (!matchesType) return false;
      }

      if (boardFilters.selectedPriorities.length > 0) {
        const issueP = issue.priority.toLowerCase();
        const matchesPri = boardFilters.selectedPriorities.some(
          (p) => p.toLowerCase() === issueP
        );
        if (!matchesPri) return false;
      }

      if (boardFilters.onlyMine) {
        if (issue.assigneeId !== currentUser.id) return false;
      } else if (boardFilters.selectedAssignee !== 'ALL') {
        if (issue.assigneeId !== boardFilters.selectedAssignee) return false;
      }

      if (boardFilters.selectedEpic !== 'ALL') {
        const parentId = issue.parentIssueId || issue.parent?.key;
        if (parentId !== boardFilters.selectedEpic) return false;
      }

      return true;
    });
  }, [optimisticIssues, activeProjectId, searchQuery, boardFilters, currentUser.id]);

  const selectedIssue = useMemo(() => {
    return optimisticIssues.find((i) => i.key === selectedIssueKey) || null;
  }, [optimisticIssues, selectedIssueKey]);

  // Actions
  const handleUpdateIssueStatus = (issueKey: string, newStatus: string) => {
    if (isViewer) {
      showToast('Viewers have read-only access. Switch to an Admin or Member persona.', 'error');
      return;
    }

    startTransition(async () => {
      setOptimisticIssues({ key: issueKey, newStatus });
      const res = await moveIssueStatus(issueKey, newStatus);
      if (res.success) {
        showToast(res.message || `Moved ${issueKey} to ${newStatus}`);
      } else {
        showToast(res.error || 'Failed to update issue status', 'error');
      }
    });
  };

  const handleCreateSwimlane = (name: string, color?: string) => {
    if (isViewer) return;
    startTransition(async () => {
      const res = await createSwimlane({ projectId: activeProjectId, name, color });
      if (res.success) {
        showToast(res.message || `Created swimlane "${name}"`);
      } else {
        showToast(res.error || 'Failed to create swimlane', 'error');
      }
    });
  };

  const handleUpdateSwimlane = (swimlaneId: string, data: { name?: string; color?: string }) => {
    if (isViewer) return;
    startTransition(async () => {
      const res = await updateSwimlane(swimlaneId, data);
      if (res.success) {
        showToast(res.message || 'Swimlane updated');
      } else {
        showToast(res.error || 'Failed to update swimlane', 'error');
      }
    });
  };

  const handleDeleteSwimlane = (swimlaneId: string) => {
    if (isViewer) return;
    startTransition(async () => {
      const res = await deleteSwimlane(swimlaneId);
      if (res.success) {
        showToast(res.message || 'Swimlane removed');
      } else {
        showToast(res.error || 'Failed to remove swimlane', 'error');
      }
    });
  };

  const handleUpdateProfile = (data: { name: string; department: string; avatarUrl?: string | null }) => {
    startTransition(async () => {
      const res = await updateUserProfile(data);
      if (res.success) {
        setIsProfileModalOpen(false);
        showToast(res.message || 'Profile updated successfully');
      } else {
        showToast(res.error || 'Failed to update profile', 'error');
      }
    });
  };

  const handleCreateIssue = (data: Parameters<typeof createIssue>[0]) => {
    if (isViewer) {
      showToast('Viewers cannot create issues.', 'error');
      return;
    }

    startTransition(async () => {
      const res = await createIssue(data);
      if (res.success) {
        setIsCreateIssueOpen(false);
        showToast(res.message || `Created issue ${res.key}`);
      } else {
        showToast(res.error || 'Failed to create issue', 'error');
      }
    });
  };

  const handleUpdateIssue = (data: {
    title?: string;
    description?: string;
    priority?: FullIssue['priority'];
    type?: FullIssue['type'];
    assigneeId?: string | null;
    storyPoints?: number;
    sprintId?: string | null;
  }) => {
    if (!selectedIssueKey || isViewer) return;

    startTransition(async () => {
      const res = await updateIssue(selectedIssueKey, data);
      if (res.success) {
        showToast(res.message || 'Issue updated');
      } else {
        showToast(res.error || 'Update failed', 'error');
      }
    });
  };

  const handleDeleteIssue = (issueKey: string) => {
    if (isViewer) return;

    startTransition(async () => {
      const res = await deleteIssue(issueKey);
      if (res.success) {
        if (selectedIssueKey === issueKey) setSelectedIssueKey(null);
        showToast(res.message || `Deleted issue ${issueKey}`);
      } else {
        showToast(res.error || 'Failed to delete issue', 'error');
      }
    });
  };

  const handleAddComment = (commentText: string) => {
    if (!selectedIssueKey || isViewer) return;

    startTransition(async () => {
      const res = await addComment(selectedIssueKey, commentText);
      if (res.success) {
        showToast('Comment saved');
      } else {
        showToast(res.error || 'Failed to save comment', 'error');
      }
    });
  };

  const handleSaveDoc = (docData: { title: string; category: string; content: string }) => {
    if (isViewer) return;

    startTransition(async () => {
      if (editingDoc) {
        const res = await updateDocument(editingDoc.id, docData);
        if (res.success) {
          setIsCreateDocOpen(false);
          setEditingDoc(null);
          showToast('Document updated successfully');
        } else {
          showToast(res.error || 'Failed to update document', 'error');
        }
      } else {
        const res = await createDocument(docData);
        if (res.success) {
          setIsCreateDocOpen(false);
          showToast('Document published successfully');
        } else {
          showToast(res.error || 'Failed to publish document', 'error');
        }
      }
    });
  };

  const handleDeleteDoc = (docId: string) => {
    if (isViewer) return;

    startTransition(async () => {
      const res = await deleteDocument(docId);
      if (res.success) {
        if (activeDocDetail?.id === docId) setActiveDocDetail(null);
        showToast('Document deleted');
      } else {
        showToast(res.error || 'Failed to delete document', 'error');
      }
    });
  };

  const handleAddUser = (userData: Parameters<typeof inviteUser>[0]) => {
    if (!isAdmin) return;

    startTransition(async () => {
      const res = await inviteUser(userData);
      if (res.success) {
        setIsAddUserOpen(false);
        showToast(res.message || 'User invited');
      } else {
        showToast(res.error || 'Failed to invite user', 'error');
      }
    });
  };

  const handleApproveUser = (userId: string, role?: UserRole) => {
    if (!isAdmin) return;

    startTransition(async () => {
      const res = await approveUser(userId, role);
      if (res.success) {
        showToast(res.message || 'User approved');
      } else {
        showToast(res.error || 'Failed to approve user', 'error');
      }
    });
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    if (!isAdmin) return;

    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        showToast(res.message || `Role updated to ${newRole}`);
      } else {
        showToast(res.error || 'Failed to update role', 'error');
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (!isAdmin) return;

    startTransition(async () => {
      const res = await removeUser(userId);
      if (res.success) {
        showToast('Team member removed');
      } else {
        showToast(res.error || 'Failed to remove user', 'error');
      }
    });
  };

  const handleSwitchPersona = (userId: string) => {
    startTransition(async () => {
      const res = await switchPersona(userId);
      if (res.success) {
        const targetName = initialUsers.find((u) => u.id === userId)?.name || 'User';
        showToast(`Switched account to ${targetName}`);
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="max-w-md text-center p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            🔒
          </div>
          <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your account (<strong className="text-white">{currentUser.email}</strong>) is currently pending approval by an organization Admin.
          </p>
          <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-400 mb-6 font-mono">
            Status: PENDING • Role: {currentUser.role}
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-slate-500 mb-2">Dev Persona Switcher:</p>
              <select
                value={currentUser.id}
                onChange={(e) => handleSwitchPersona(e.target.value)}
                className="bg-slate-700 text-white text-xs px-3 py-1.5 rounded border border-slate-600 cursor-pointer"
              >
                {initialUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    Switch to {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 overflow-hidden font-sans">
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Dim backdrop overlay for mobile off-canvas drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        currentUser={currentUser}
        users={initialUsers}
        projects={initialProjects}
        activeProjectId={activeProjectId}
        onSelectProject={(projId) => setActiveProjectId(projId)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        completionRate={initialMetrics.completionRate}
        completedPoints={initialMetrics.completedPoints}
        totalPoints={initialMetrics.totalPoints}
        onSwitchPersona={handleSwitchPersona}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col w-full min-w-0 overflow-hidden bg-[#f8fafc] dark:bg-[#09090b]">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          isViewer={isViewer}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenCreateIssue={() => {
            if (isViewer) {
              showToast('Viewers cannot create issues. Please switch roles.', 'error');
              return;
            }
            setIsCreateIssueOpen(true);
          }}
          onOpenCreateDoc={() => {
            if (isViewer) {
              showToast('Viewers cannot add documents.', 'error');
              return;
            }
            setEditingDoc(null);
            setIsCreateDocOpen(true);
          }}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onSelectIssue={(key) => setSelectedIssueKey(key)}
        />

        {/* Secondary Compound Filter Bar - Only visible on board & backlog views */}
        {(activeTab === 'board' || activeTab === 'backlog') && (
          <BoardFilters
            filters={boardFilters}
            onChangeFilters={setBoardFilters}
            users={initialUsers}
            allIssues={optimisticIssues}
            metrics={initialMetrics}
            currentUserId={currentUser.id}
          />
        )}

        {/* View Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          {activeTab === 'board' && (
            <KanbanBoardView
              issues={filteredIssues}
              users={initialUsers}
              swimlanes={activeSwimlanes}
              onSelectIssue={(key) => setSelectedIssueKey(key)}
              onStatusChange={handleUpdateIssueStatus}
              onCreateSwimlane={handleCreateSwimlane}
              onUpdateSwimlane={handleUpdateSwimlane}
              onDeleteSwimlane={handleDeleteSwimlane}
              isViewer={isViewer}
              currentUserId={currentUser.id}
            />
          )}

          {activeTab === 'backlog' && (
            <BacklogView
              issues={filteredIssues}
              users={initialUsers}
              sprints={optimisticSprints}
              swimlanes={activeSwimlanes}
              onSelectIssue={(key) => setSelectedIssueKey(key)}
              onStatusChange={handleUpdateIssueStatus}
              onCreateIssue={() => setIsCreateIssueOpen(true)}
              onUpdateSprint={handleUpdateSprint}
              isViewer={isViewer}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              docs={initialDocs}
              users={initialUsers}
              onSelectDoc={(doc) => setActiveDocDetail(doc)}
              onEditDoc={(doc) => {
                if (isViewer) {
                  showToast('Viewers cannot edit documentation.', 'error');
                  return;
                }
                setEditingDoc(doc);
                setIsCreateDocOpen(true);
              }}
              onDeleteDoc={handleDeleteDoc}
              onCreateDoc={() => {
                if (isViewer) {
                  showToast('Viewers cannot create documents.', 'error');
                  return;
                }
                setEditingDoc(null);
                setIsCreateDocOpen(true);
              }}
              isViewer={isViewer}
            />
          )}

          {activeTab === 'team' && (
            <TeamManagementView
              users={initialUsers}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onAddUser={() => setIsAddUserOpen(true)}
              onApproveUser={handleApproveUser}
              onUpdateRole={handleUpdateUserRole}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'metrics' && (
            <MetricsReportView
              issues={optimisticIssues}
              users={initialUsers}
              metrics={initialMetrics}
              sprints={optimisticSprints}
            />
          )}
        </div>
      </main>

      {/* Drawers & Modals */}
      {selectedIssue && (
        <IssueDetailDrawer
          issue={selectedIssue}
          users={initialUsers}
          currentUser={currentUser}
          swimlanes={activeSwimlanes}
          allIssues={optimisticIssues}
          sprints={optimisticSprints}
          onNavigateIssue={(key) => setSelectedIssueKey(key)}
          isViewer={isViewer}
          onClose={() => setSelectedIssueKey(null)}
          onStatusChange={(status) => handleUpdateIssueStatus(selectedIssue.key, status)}
          onDelete={() => handleDeleteIssue(selectedIssue.key)}
          onUpdateIssue={handleUpdateIssue}
          onAddComment={handleAddComment}
          onUploadSuccess={() => {
            showToast('File attached via Cloudflare R2 bucket');
          }}
        />
      )}

      {isCreateIssueOpen && (
        <CreateIssueModal
          users={initialUsers}
          currentUser={currentUser}
          projects={initialProjects}
          activeProjectId={activeProjectId}
          swimlanes={activeSwimlanes}
          issues={optimisticIssues}
          sprints={optimisticSprints}
          onClose={() => setIsCreateIssueOpen(false)}
          onCreate={handleCreateIssue}
        />
      )}

      {isCreateDocOpen && (
        <CreateDocModal
          initialDoc={editingDoc}
          onClose={() => {
            setIsCreateDocOpen(false);
            setEditingDoc(null);
          }}
          onSave={handleSaveDoc}
        />
      )}

      {activeDocDetail && (
        <DocumentReaderModal
          doc={activeDocDetail}
          onClose={() => setActiveDocDetail(null)}
          onEdit={() => {
            if (isViewer) {
              showToast('Viewers cannot edit documentation.', 'error');
              return;
            }
            setEditingDoc(activeDocDetail);
            setActiveDocDetail(null);
            setIsCreateDocOpen(true);
          }}
        />
      )}

      {isAddUserOpen && (
        <AddUserModal
          onClose={() => setIsAddUserOpen(false)}
          onAdd={handleAddUser}
        />
      )}

      {isProjectsModalOpen && (
        <ProjectsModal
          projects={initialProjects}
          activeProjectId={activeProjectId}
          users={initialUsers}
          isViewer={isViewer}
          onSelectProject={(projId) => {
            setActiveProjectId(projId);
            setIsProjectsModalOpen(false);
          }}
          onClose={() => setIsProjectsModalOpen(false)}
          onShowToast={showToast}
        />
      )}

      {isProfileModalOpen && (
        <UserProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
}
