'use client';

import React from 'react';
import { Edit3, X, Paperclip, Download } from 'lucide-react';
import { FullDocument } from '@/lib/types';

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
  const author = doc.author;
  const formattedDate = new Date(doc.updatedAt).toISOString().replace('T', ' ').substring(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded font-bold">
              {doc.category}
            </span>
            <span className="text-xs text-slate-400">Updated {formattedDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-500 hover:text-blue-600 rounded"
              title="Edit document"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {doc.title}
          </h1>
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            {author && (
              <div className="flex items-center gap-2">
                <img
                  src={author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                  alt={author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {author.name}
                </span>
                <span>({author.department})</span>
              </div>
            )}
          </div>

          {/* Render Markdown content */}
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
            {doc.content}
          </div>

          {/* Attachments */}
          {doc.attachments && doc.attachments.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs uppercase font-bold text-slate-400 mb-3">
                Attachments ({doc.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doc.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={`/api/attachments/${att.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs hover:border-blue-500 transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {att.fileName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(att.sizeBytes / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
