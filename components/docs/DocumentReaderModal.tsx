'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  X,
  Paperclip,
  Download,
  Printer,
  FileText,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  Flag,
  Tag,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { FullDocument } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DocumentReaderModalProps {
  doc: FullDocument;
  onClose: () => void;
  onEdit: () => void;
}

// Pure Tailwind UI Mockup Component for Workspace Layout Overview
function VisualWorkspaceMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xl font-sans not-prose">
      <div className="text-xs font-mono font-bold text-blue-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          APEXTRACK WORKSPACE LAYOUT OVERVIEW
        </span>
        <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded font-mono">
          Interactive UI Component
        </span>
      </div>

      {/* Mini Workspace Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">Completion Rate</span>
          <span className="font-bold text-sm text-emerald-400">75%</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">Velocity</span>
          <span className="font-bold text-sm text-blue-400">28/35 pts</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">In Flight</span>
          <span className="font-bold text-sm text-amber-400">5 issues</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <span className="text-[10px] text-slate-400 block font-mono">Open Defects</span>
          <span className="font-bold text-sm text-rose-400">2 defects</span>
        </div>
      </div>

      {/* Mini Kanban Columns Carousel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* To Do */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">TO DO</span>
            <span className="text-[10px] font-mono bg-slate-700 px-1.5 py-0.2 rounded text-slate-300">3</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xs">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">APEX-103</span>
            <p className="font-medium text-slate-200 text-xs mb-2">Knowledge Base Setup</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">8 pts</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-300">IN PROGRESS</span>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded">WIP 5</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-amber-500/50 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] text-blue-400 font-bold">APEX-101</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded flex items-center gap-1 font-bold">
                🚩 Flagged
              </span>
            </div>
            <p className="font-medium text-slate-200 text-xs mb-2">D1 Edge Schema</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">5 pts</span>
          </div>
        </div>

        {/* In Review */}
        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300">IN REVIEW</span>
            <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded">WIP 4</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xs">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">APEX-102</span>
            <p className="font-medium text-slate-200 text-xs mb-2">Kanban Drag Fix</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">3 pts</span>
          </div>
        </div>

        {/* Done */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300">DONE</span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">8</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xs">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">APEX-104</span>
            <p className="font-medium text-slate-200 text-xs mb-2">RBAC Auth Logic</p>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded font-mono">5 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pure Tailwind UI Mockup Component for Issue Detail Drawer
function VisualDrawerMockup() {
  return (
    <div className="my-6 p-4 md:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-xl font-sans not-prose">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-0.5 rounded">
            APEX-101
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
            Design & Connect Cloudflare D1 Distributed Edge Schema
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Flag className="w-3 h-3 fill-amber-500 text-amber-500" /> Flagged Blocker
        </span>
      </div>

      {/* Subtasks Checklist Visual */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 dark:text-zinc-400">Subtask Progress Checklist</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">2 of 3 completed (66%)</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div className="bg-emerald-500 h-2 rounded-full w-2/3 transition-all duration-300" />
        </div>
        <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-300 pt-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="line-through text-slate-400">Define Drizzle ORM SQLite tables in db/schema.ts</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="line-through text-slate-400">Generate D1 migration scripts via drizzle-kit</span>
          </div>
          <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-medium">
            <span className="w-3.5 h-3.5 rounded-full border border-slate-400 dark:border-zinc-600 flex-shrink-0" />
            <span>Benchmark edge response times across Anycast PoPs</span>
          </div>
        </div>
      </div>

      {/* Linked Issue Chips */}
      <div className="flex flex-wrap gap-2 text-xs pt-3 border-t border-slate-100 dark:border-zinc-800">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
          <span className="text-slate-400 text-[11px]">blocks</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">APEX-102</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
          <span className="text-slate-400 text-[11px]">relates to</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">CORE-101</span>
        </span>
      </div>
    </div>
  );
}

export function DocumentReaderModal({
  doc,
  onClose,
  onEdit,
}: DocumentReaderModalProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const author = doc.author;
  const formattedDate = new Date(doc.updatedAt)
    .toISOString()
    .replace('T', ' ')
    .substring(0, 16);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadMarkdown = () => {
    setIsExportOpen(false);
    const blob = new Blob([doc.content], {
      type: 'text/markdown;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (doc.title || 'document')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.setAttribute('download', `${safeTitle}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    setIsExportOpen(false);
    const innerHTMLContent = contentRef.current ? contentRef.current.innerHTML : '';
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${doc.title}</title><style>body{font-family:Arial,sans-serif;line-height:1.6;padding:24px;color:#1e293b;} h1{font-size:24px;color:#0f172a;} h2{font-size:18px;border-bottom:1px solid #cbd5e1;padding-bottom:6px;margin-top:20px;} table{border-collapse:collapse;width:100%;margin:16px 0;} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;} th{background-color:#f1f5f9;font-weight:bold;} blockquote{border-left:4px solid #3b82f6;padding-left:12px;color:#475569;margin:16px 0;background-color:#f8fafc;} pre{background:#0f172a;color:#f8fafc;padding:12px;border-radius:6px;font-family:monospace;}</style></head><body>`;
    const blob = new Blob(['\ufeff' + header + innerHTMLContent + "</body></html>"], {
      type: 'application/msword;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (doc.title || 'document')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.setAttribute('download', `${safeTitle}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    setIsExportOpen(false);
    const innerHTMLContent = contentRef.current ? contentRef.current.innerHTML : '';
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up window blocked. Please allow pop-ups to print/export as PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
            h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.75rem; color: #0f172a; }
            h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; color: #1e293b; }
            h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; color: #0f172a; }
            tr:nth-child(even) { background-color: #f8fafc; }
            pre { background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px; white-space: pre-wrap; word-break: break-all; margin: 1.5rem 0; }
            blockquote { border-left: 4px solid #3b82f6; padding: 12px 16px; background-color: #eff6ff; border-radius: 0 8px 8px 0; margin: 1.5rem 0; color: #1e40af; }
            .no-print { display: none !important; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${innerHTMLContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  // Custom components for ReactMarkdown to render rich callouts, kanban cards & comparison tables
  const markdownComponents = {
    blockquote: ({ children }: any) => {
      let textContent = '';
      const extractText = (node: any) => {
        if (typeof node === 'string') textContent += node;
        else if (Array.isArray(node)) node.forEach(extractText);
        else if (node?.props?.children) extractText(node.props.children);
      };
      extractText(children);

      const trimmed = textContent.trim();

      if (trimmed.startsWith('[!NOTE]') || trimmed.startsWith('[!INFO]')) {
        const cleanText = trimmed.replace(/^\[!(NOTE|INFO)\]\s*/i, '');
        return (
          <div className="my-5 p-4 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed font-sans">
              <strong className="block font-bold text-blue-800 dark:text-blue-300 mb-1">
                NOTE
              </strong>
              <div>{cleanText || children}</div>
            </div>
          </div>
        );
      }

      if (
        trimmed.startsWith('[!WARNING]') ||
        trimmed.startsWith('[!CAUTION]')
      ) {
        const cleanText = trimmed.replace(/^\[!(WARNING|CAUTION)\]\s*/i, '');
        return (
          <div className="my-5 p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed font-sans">
              <strong className="block font-bold text-amber-800 dark:text-amber-300 mb-1">
                WARNING
              </strong>
              <div>{cleanText || children}</div>
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('[!TIP]')) {
        const cleanText = trimmed.replace(/^\[!TIP\]\s*/i, '');
        return (
          <div className="my-5 p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed font-sans">
              <strong className="block font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                PRO TIP
              </strong>
              <div>{cleanText || children}</div>
            </div>
          </div>
        );
      }

      return (
        <blockquote className="my-5 pl-4 border-l-4 border-slate-300 dark:border-zinc-700 italic text-slate-700 dark:text-zinc-300 bg-slate-50/60 dark:bg-zinc-800/40 py-2.5 pr-4 rounded-r-lg">
          {children}
        </blockquote>
      );
    },

    pre: ({ children }: any) => {
      return (
        <pre className="my-4 p-4 text-xs font-mono bg-slate-900 dark:bg-zinc-950 text-slate-100 rounded-xl overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 shadow-md">
          {children}
        </pre>
      );
    },

    code: ({ node, inline, className, children, ...props }: any) => {
      const rawText = String(children).replace(/\n$/, '');
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';

      // Intercept ASCII wireframe code blocks and replace with Pure Tailwind UI Components
      if (
        lang === 'ascii' ||
        lang === 'wireframe' ||
        rawText.includes('APEXTRACK WORKSPACE') ||
        rawText.includes('+---------------------------------') ||
        rawText.includes('KANBAN BOARD')
      ) {
        return <VisualWorkspaceMockup />;
      }

      if (rawText.includes('ISSUE DETAIL DRAWER')) {
        return <VisualDrawerMockup />;
      }

      if (lang === 'kanban' || lang === 'card') {
        const lines = rawText.split('\n');
        const data: Record<string, string> = {};
        lines.forEach((line) => {
          const idx = line.indexOf(':');
          if (idx !== -1) {
            const k = line.substring(0, idx).trim().toLowerCase();
            const v = line.substring(idx + 1).trim();
            data[k] = v;
          }
        });

        return (
          <div className="my-6 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-md max-w-sm font-sans not-prose">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded">
                {data.key || 'APEX-101'}
              </span>
              <div className="flex items-center gap-1.5">
                {data.flagged === 'true' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                    <Flag className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Flagged
                  </span>
                )}
                <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {data.status || 'In Progress'}
                </span>
              </div>
            </div>

            <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 mb-3">
              {data.title || 'Untitled Issue'}
            </h4>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <img
                  src={
                    data.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={data.assignee || 'Assignee'}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-zinc-700"
                />
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  {data.assignee || 'Unassigned'}
                </span>
              </div>
              <span className="font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {data.points || '3 pts'}
              </span>
            </div>
          </div>
        );
      }

      if (!inline) {
        return (
          <code className="font-mono text-xs text-slate-100 leading-relaxed whitespace-pre" {...props}>
            {children}
          </code>
        );
      }

      return (
        <code
          className="bg-slate-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 whitespace-nowrap"
          {...props}
        >
          {children}
        </code>
      );
    },

    table: ({ children }: any) => (
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-700/80 shadow-xs">
        <table className="w-full text-left border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-slate-100/90 dark:bg-zinc-800/90 border-b border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="even:bg-slate-50/70 dark:even:bg-zinc-800/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }: any) => (
      <th className="p-3 text-left font-bold text-slate-900 dark:text-zinc-100 border-r last:border-r-0 border-slate-200 dark:border-zinc-700 text-xs uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="p-3 text-slate-700 dark:text-zinc-300 border-r last:border-r-0 border-slate-200 dark:border-zinc-700/60 text-sm">
        {children}
      </td>
    ),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6 animate-fade-in overflow-y-auto">
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Notion / Confluence Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/90 no-print flex-shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono px-2.5 py-1 rounded-md font-bold uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3" /> {doc.category}
            </span>
            {author && (
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-full text-xs shadow-xs">
                <img
                  src={
                    author.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={author.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="font-semibold text-slate-700 dark:text-zinc-200">
                  {author.name}
                </span>
              </div>
            )}
            <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Updated {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Export Document</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isExportOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Download Markdown (.md)
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Download Word (.doc)
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition"
                  >
                    <Printer className="w-4 h-4 text-emerald-500" />
                    Print / Save as PDF
                  </button>
                </div>
              )}
            </div>

            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
                title="Edit document"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="p-6 md:p-10 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-zinc-950/50">
          <div
            ref={contentRef}
            className="max-w-4xl mx-auto py-8 px-6 md:px-10 bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-border/40"
          >
            {/* ReactMarkdown prose container */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2 prose-table:w-full prose-table:border prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3 prose-td:border-b font-sans">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {doc.content}
              </ReactMarkdown>
            </div>

            {/* Attachments Section */}
            {doc.attachments && doc.attachments.length > 0 && (
              <div className="pt-8 mt-10 border-t border-slate-200 dark:border-zinc-800 no-print">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-500" />
                  Attachments ({doc.attachments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {doc.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={`/api/attachments/${att.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-xs hover:border-blue-500 hover:shadow-sm transition group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Paperclip className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="truncate">
                          <p className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                            {att.fileName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(att.sizeBytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


