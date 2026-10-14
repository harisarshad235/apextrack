'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Kanban,
  Layers,
  FileText,
  Users,
  BarChart3,
  Plus,
  FolderKanban,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FullIssue, Project, User } from '@/lib/types';
import { useTheme } from 'next-themes';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  issues: FullIssue[];
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onSelectTab: (tab: string) => void;
  onSelectIssue: (issueKey: string) => void;
  onOpenCreateIssue: () => void;
  onOpenCreateDoc: () => void;
  onOpenProjectsModal: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  issues,
  projects,
  activeProjectId,
  onSelectProject,
  onSelectTab,
  onSelectIssue,
  onOpenCreateIssue,
  onOpenCreateDoc,
  onOpenProjectsModal,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut listener: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger handled in parent or opened directly
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Command items definitions
  interface ActionItem {
    id: string;
    title: string;
    subtitle?: string;
    category: 'Actions' | 'Navigation' | 'Issues' | 'Projects';
    icon: React.ElementType;
    iconColor?: string;
    onExecute: () => void;
  }

  const baseActions: ActionItem[] = [
    {
      id: 'create-issue',
      title: 'Create New Issue',
      subtitle: 'Open task modal to create a story, bug, or task',
      category: 'Actions',
      icon: Plus,
      iconColor: 'text-indigo-400',
      onExecute: () => {
        onOpenCreateIssue();
        onClose();
      },
    },
    {
      id: 'create-doc',
      title: 'New Knowledge Base Document',
      subtitle: 'Create technical specs or architecture notes',
      category: 'Actions',
      icon: FileText,
      iconColor: 'text-cyan-400',
      onExecute: () => {
        onOpenCreateDoc();
        onClose();
      },
    },
    {
      id: 'toggle-theme',
      title: `Toggle Theme (Current: ${theme === 'dark' ? 'Dark Obsidian' : 'Light'})`,
      subtitle: 'Switch between Obsidian dark and light modes',
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      iconColor: 'text-amber-400',
      onExecute: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onClose();
      },
    },
    {
      id: 'nav-board',
      title: 'Go to Kanban Board',
      subtitle: 'View active sprint cards & columns',
      category: 'Navigation',
      icon: Kanban,
      iconColor: 'text-indigo-400',
      onExecute: () => {
        onSelectTab('board');
        onClose();
      },
    },
    {
      id: 'nav-backlog',
      title: 'Go to Backlog',
      subtitle: 'Sprint planning and issue prioritization',
      category: 'Navigation',
      icon: Layers,
      iconColor: 'text-cyan-400',
      onExecute: () => {
        onSelectTab('backlog');
        onClose();
      },
    },
    {
      id: 'nav-metrics',
      title: 'Velocity & Burndown Metrics',
      subtitle: 'Sprint analytics and flow metrics',
      category: 'Navigation',
      icon: BarChart3,
      iconColor: 'text-emerald-400',
      onExecute: () => {
        onSelectTab('metrics');
        onClose();
      },
    },
    {
      id: 'nav-docs',
      title: 'Knowledge Base Documentation',
      subtitle: 'Browse engineering specs and team docs',
      category: 'Navigation',
      icon: FileText,
      iconColor: 'text-purple-400',
      onExecute: () => {
        onSelectTab('documents');
        onClose();
      },
    },
    {
      id: 'nav-team',
      title: 'Team Capacity & Members',
      subtitle: 'Manage roles and project assignments',
      category: 'Navigation',
      icon: Users,
      iconColor: 'text-blue-400',
      onExecute: () => {
        onSelectTab('team');
        onClose();
      },
    },
    {
      id: 'nav-projects',
      title: 'Project Settings & Workspaces',
      subtitle: 'Manage projects and keys',
      category: 'Navigation',
      icon: FolderKanban,
      iconColor: 'text-slate-400',
      onExecute: () => {
        onOpenProjectsModal();
        onClose();
      },
    },
  ];

  // Map issues to search items
  const issueActions: ActionItem[] = issues.slice(0, 15).map((issue) => ({
    id: `issue-${issue.key}`,
    title: `${issue.key}: ${issue.title}`,
    subtitle: `${issue.status} • ${issue.priority} Priority • ${issue.assignee?.name || 'Unassigned'}`,
    category: 'Issues',
    icon: CheckCircle2,
    iconColor:
      issue.status === 'Done'
        ? 'text-emerald-400'
        : issue.priority === 'Critical'
        ? 'text-rose-400'
        : 'text-indigo-400',
    onExecute: () => {
      onSelectIssue(issue.key);
      onClose();
    },
  }));

  // Map projects to search items
  const projectActions: ActionItem[] = projects.map((p) => ({
    id: `proj-${p.id}`,
    title: `Switch to ${p.name} (${p.key})`,
    subtitle: p.description || 'Active workspace',
    category: 'Projects',
    icon: FolderKanban,
    iconColor: p.id === activeProjectId ? 'text-cyan-400' : 'text-slate-400',
    onExecute: () => {
      onSelectProject(p.id);
      onClose();
    },
  }));

  const allItems = [...baseActions, ...issueActions, ...projectActions];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onExecute();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#11141B] border border-[#232836] shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#232836] bg-[#0A0C10]/60">
              <Search className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0 animate-pulse" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command, search issues (e.g. KYN-101), or navigate..."
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="ml-2 hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-[#171B24] rounded border border-[#232836]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#232836]/40 scrollbar-none"
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No matching commands or issues found for "{query}".
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.onExecute()}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#171B24] border border-[#343C50] text-white shadow-sm'
                          : 'text-slate-300 hover:bg-[#171B24]/50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-lg bg-[#0A0C10] border border-[#232836] flex-shrink-0 ${
                            item.iconColor || 'text-indigo-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-slate-100 truncate flex items-center gap-2">
                            <span>{item.title}</span>
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0A0C10] text-slate-400 border border-[#232836]">
                          {item.category}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="px-4 py-2 border-t border-[#232836] bg-[#0A0C10]/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#171B24] border border-[#232836] text-[10px]">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[#171B24] border border-[#232836] text-[10px]">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1 text-cyan-400/90">
                <Sparkles className="w-3 h-3" />
                <span>Kynov Velocity Command</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
