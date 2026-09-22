'use client';

import React, { useState } from 'react';
import { HistoryItem } from '@/lib/types';
import { X, History, Trash2, Download, ExternalLink, Filter, Search, FileText } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem,
}) => {
  const [filter, setFilter] = useState<'all' | 'AI-Generated' | 'Human-Written' | 'Uncertain'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const matchesFilter = filter === 'all' || item.classification === filter;
    const matchesSearch = item.textSnippet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.fileName && item.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = 'ID,Timestamp,Classification,AI Probability %,Word Count,File Name,Snippet\n';
    const rows = history.map(h => 
      `"${h.id}","${h.timestamp}","${h.classification}",${h.aiProbability},${h.wordCount},"${h.fileName || ''}","${h.textSnippet.replace(/"/g, '""')}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ai_detection_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2F4860]/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md h-full bg-white border-l border-[#7DA7D9]/30 flex flex-col justify-between shadow-2xl p-6 overflow-y-auto">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#7DA7D9]/25">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#5b8cc4]" />
              <h2 className="text-lg font-bold text-[#2F4860] tracking-wide">Analysis History</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#DCEEFF] text-[#2F4860]/60 hover:text-[#2F4860] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Export bar */}
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#5b8cc4] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search history snippets or filenames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f4f9ff] border border-[#7DA7D9]/30 rounded-xl text-[#2F4860] outline-none focus:border-[#5b8cc4] placeholder:text-[#2F4860]/40"
              />
            </div>

            {/* Filter pills — Ice & Butter */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex gap-1">
                {(['all', 'AI-Generated', 'Human-Written', 'Uncertain'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded-lg border text-[11px] transition-all ${
                      filter === f
                        ? 'bg-[#2F4860] text-white border-[#2F4860]'
                        : 'bg-[#DCEEFF]/50 text-[#2F4860]/70 border-[#7DA7D9]/30 hover:bg-[#DCEEFF]'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'AI-Generated' ? 'AI' : f === 'Human-Written' ? 'Human' : 'Mixed'}
                  </button>
                ))}
              </div>

              {history.length > 0 && (
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1 text-[#5b8cc4] hover:text-[#2F4860] text-[11px] font-medium"
                  title="Export History Report as CSV"
                >
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              )}
            </div>
          </div>

          {/* History Item Cards */}
          <div className="mt-4 space-y-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 text-[#2F4860]/50 text-xs">
                {history.length === 0 ? 'No prior analyses stored yet.' : 'No matching results found.'}
              </div>
            ) : (
              filteredHistory.map((item) => {
                const isAI = item.classification === 'AI-Generated';
                const isHuman = item.classification === 'Human-Written';

                const badgeBg = isAI
                  ? 'bg-[#7DA7D9]/20 text-[#2F4860] border-[#5b8cc4]/40'
                  : isHuman
                  ? 'bg-[#DCEEFF]/70 text-[#2F4860] border-[#7DA7D9]/40'
                  : 'bg-[#FFF7CC] text-[#2F4860] border-[#7DA7D9]/40';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#f4f9ff] hover:bg-white border border-[#7DA7D9]/25 hover:border-[#5b8cc4]/50 transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-sm"
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                        {item.classification} ({item.aiProbability}%)
                      </span>
                      <span className="text-[10px] text-[#2F4860]/55">{item.timestamp}</span>
                    </div>

                    {item.fileName && (
                      <span className="text-[11px] text-[#5b8cc4] flex items-center gap-1 font-mono">
                        <FileText className="w-3 h-3" /> {item.fileName}
                      </span>
                    )}

                    <p className="text-xs text-[#2F4860]/80 line-clamp-2 italic">
                      &quot;{item.textSnippet}&quot;
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#7DA7D9]/20 text-[10px] text-[#2F4860]/60">
                      <span>{item.wordCount} words</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[#5b8cc4] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          Reload <ExternalLink className="w-3 h-3" />
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteItem(item.id);
                          }}
                          className="text-[#2F4860]/40 hover:text-red-600 p-0.5"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Clear All */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-[#7DA7D9]/25 mt-4">
            <button
              onClick={onClearHistory}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History Memory
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
