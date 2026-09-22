'use client';

import React from 'react';
import { TextStatistics } from '@/lib/types';
import { BarChart2, Hash, FileText, AlignLeft, Clock, MessageSquare } from 'lucide-react';

interface TextStatsCardProps {
  stats: TextStatistics;
}

export const TextStatsCard: React.FC<TextStatsCardProps> = ({ stats }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#7DA7D9]/25 shadow-[0_8px_32px_rgba(47,72,96,0.10)] space-y-4 bg-white/90">
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#7DA7D9]/20">
        <BarChart2 className="w-4 h-4 text-[#5b8cc4]" />
        <h3 className="text-sm font-semibold text-[#2F4860] tracking-wide">
          Text Statistics & Metrics
        </h3>
      </div>

      {/* Grid — Ice & Butter tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        
        <div className="p-3 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/25 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#2F4860] text-[#FFF7CC]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#2F4860]/60 uppercase font-semibold block">Words</span>
            <span className="text-lg font-bold text-[#2F4860] font-mono">{stats.wordCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#DCEEFF]/50 border border-[#7DA7D9]/25 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-[#7DA7D9]/30 text-[#2F4860]">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#2F4860]/60 uppercase font-semibold block">Characters</span>
            <span className="text-lg font-bold text-[#2F4860] font-mono">{stats.characterCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF7CC]/70 border border-[#7DA7D9]/25 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#FFF7CC] border border-[#7DA7D9]/30 text-[#2F4860]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#2F4860]/60 uppercase font-semibold block">Sentences</span>
            <span className="text-lg font-bold text-[#2F4860] font-mono">{stats.sentenceCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/25 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#7DA7D9] text-white">
            <AlignLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#2F4860]/60 uppercase font-semibold block">Paragraphs</span>
            <span className="text-lg font-bold text-[#2F4860] font-mono">{stats.paragraphCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#DCEEFF]/50 border border-[#7DA7D9]/25 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white border border-[#7DA7D9]/30 text-[#5b8cc4]">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#2F4860]/60 uppercase font-semibold block">Avg Sentence Len</span>
            <span className="text-lg font-bold text-[#2F4860] font-mono">{stats.avgSentenceLength} <span className="text-xs text-[#2F4860]/50">wds</span></span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF7CC]/70 border border-[#7DA7D9]/25 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#2F4860] text-[#FFF7CC]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-[#2F4860]/60 uppercase font-semibold block">Est Read Time</span>
            <span className="text-lg font-bold text-[#2F4860] font-mono">{stats.readingTimeMinutes} <span className="text-xs text-[#2F4860]/50">min</span></span>
          </div>
        </div>

      </div>

    </div>
  );
};
