'use client';

import React, { useState } from 'react';
import { SentenceScore } from '@/lib/types';
import { Sparkles, Info } from 'lucide-react';

interface SentenceHeatmapProps {
  sentences: SentenceScore[];
}

export const SentenceHeatmap: React.FC<SentenceHeatmapProps> = ({ sentences }) => {
  const [hoveredSentence, setHoveredSentence] = useState<SentenceScore | null>(null);

  if (!sentences || sentences.length === 0) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#7DA7D9]/25 shadow-[0_8px_32px_rgba(47,72,96,0.10)] space-y-4 bg-white/90">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#7DA7D9]/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#5b8cc4]" />
          <h3 className="text-sm font-semibold text-[#2F4860] tracking-wide">
            Sentence-by-Sentence AI Heatmap
          </h3>
        </div>

        {/* Legend — Ice & Butter */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#7DA7D9] border border-[#5b8cc4]" />
            <span className="text-[#2F4860] font-medium">Likely AI (&ge;65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#FFF7CC] border border-[#7DA7D9]" />
            <span className="text-[#2F4860] font-medium">Uncertain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#e8d9ed] border border-[#b694c7]/60" />
            <span className="text-[#2F4860] font-medium">Likely Human (&le;35%)</span>
          </div>
        </div>
      </div>

      {/* Sentence Highlight View */}
      <div className="p-4 bg-[#f4f9ff] rounded-xl border border-[#7DA7D9]/25 leading-relaxed text-sm font-sans space-x-1.5 text-[#2F4860]">
        {sentences.map((item, idx) => {
          // Color strictly by classification so highlight always matches the label.
          const bgStyle = item.classification === 'AI-Generated'
            ? 'bg-[#7DA7D9]/30 hover:bg-[#7DA7D9]/45 text-[#2F4860] border-[#5b8cc4]/50'
            : item.classification === 'Human-Written'
            ? 'bg-[#e8d9ed]/70 hover:bg-[#e8d9ed] text-[#2F4860] border-[#b694c7]/50'
            : 'bg-[#FFF7CC] hover:bg-[#ffef99] text-[#2F4860] border-[#7DA7D9]/40';

          return (
            <span
              key={idx}
              onMouseEnter={() => setHoveredSentence(item)}
              onMouseLeave={() => setHoveredSentence(null)}
              className={`inline-block px-1.5 py-0.5 my-0.5 rounded border transition-all cursor-pointer ${bgStyle}`}
            >
              {item.text}
            </span>
          );
        })}
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className="p-3 rounded-xl bg-white border border-[#7DA7D9]/30 flex items-center justify-between text-xs min-h-[44px] shadow-sm">
        {hoveredSentence ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-[#2F4860] italic truncate max-w-[70%]">
              &quot;{hoveredSentence.text}&quot;
            </span>
            <span className={`font-mono font-bold text-[#2F4860] px-2 py-0.5 rounded-full border ${
              hoveredSentence.classification === 'Human-Written'
                ? 'bg-[#e8d9ed] border-[#b694c7]/50'
                : hoveredSentence.classification === 'AI-Generated'
                ? 'bg-[#7DA7D9]/30 border-[#5b8cc4]/50'
                : 'bg-[#FFF7CC] border-[#7DA7D9]/30'
            }`}>
              {hoveredSentence.classification === 'Human-Written'
                ? `Human ${hoveredSentence.humanProbability}%`
                : hoveredSentence.classification === 'AI-Generated'
                ? `AI ${hoveredSentence.aiProbability}%`
                : `Uncertain ${hoveredSentence.uncertainProbability}%`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#2F4860]/55">
            <Info className="w-3.5 h-3.5 text-[#5b8cc4]" />
            <span>Hover over any sentence above to inspect its individual AI likelihood score.</span>
          </div>
        )}
      </div>

    </div>
  );
};
