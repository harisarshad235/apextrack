'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, Paperclip } from 'lucide-react';
import { FullDocument, User } from '@/lib/types';

interface DocumentsViewProps {
  docs: FullDocument[];
  users: User[];
  onSelectDoc: (doc: FullDocument) => void;
  onEditDoc: (doc: FullDocument) => void;
  onDeleteDoc: (docId: string) => void;
  onCreateDoc: () => void;
  isViewer: boolean;
}

export function DocumentsView({
  docs,
  users,
  onSelectDoc,
  onEditDoc,
  onDeleteDoc,
  onCreateDoc,
  isViewer,
}: DocumentsViewProps) {
  const [docCategory, setDocCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(docs.map((d) => d.category)))];
  }, [docs]);

  const filteredDocs = useMemo(() => {
    if (docCategory === 'ALL') return docs;
    return docs.filter((d) => d.category === docCategory);
  }, [docs, docCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Confluence Spaces
          </span>
          <h2 className="text-2xl font-bold mt-2">Project Knowledge & ADRs</h2>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Central repository for architectural decision records, PRDs, sprint runbooks, and live file attachments.
          </p>
        </div>
        <button
          onClick={onCreateDoc}
          disabled={isViewer}
          className="flex items-center gap-2 bg-white text-blue-800 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Document
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setDocCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${docCategory === cat
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map((doc) => {
          const author = doc.author;
          const formattedDate = new Date(doc.updatedAt).toISOString().replace('T', ' ').substring(0, 16);

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    {doc.category}
                  </span>
                  {!isViewer && (
                    <div
                      className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEditDoc(doc)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit document"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mb-2">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                  {doc.content.replace(/[#*`_]/g, '')}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  {author && (
                    <img
                      src={author.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                      alt={author.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-[11px] truncate">{author?.name || 'Author'}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {doc.attachments?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      {doc.attachments.length}
                    </span>
                  )}
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
