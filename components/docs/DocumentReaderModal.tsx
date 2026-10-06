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

export function DocumentReaderModal({
  doc,
  onClose,
  onEdit,
}: DocumentReaderModalProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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

  const handlePrintPDF = () => {
    setIsExportOpen(false);
    window.print();
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

    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';

      if (lang === 'kanban' || lang === 'card') {
        const rawText = String(children).replace(/\n$/, '');
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

      if (!inline && match) {
        return (
          <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-md">
            <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span>{lang}</span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed">
              <code>{children}</code>
            </pre>
          </div>
        );
      }

      return (
        <code
          className="bg-slate-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700"
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
      {/* Print CSS Injection */}
      <style>{`
        @media print {
          body > *:not(#printable-doc-root) {
            display: none !important;
          }
          #printable-doc-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-doc-root"
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
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Download Markdown (.md)
                  </button>
                  <button
                    onClick={handlePrintPDF}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 flex items-center gap-2 transition"
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
          <div className="max-w-4xl mx-auto py-8 px-6 md:px-10 bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-border/40">
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

