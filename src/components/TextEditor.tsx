'use client';

import React from 'react';
import { SAMPLE_TEXTS } from '@/lib/sampleTexts';
import { FileText, Trash2, Clipboard, Sparkles, Send, Type } from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
  wordCount: number;
  charCount: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  onAnalyze,
  onClear,
  isAnalyzing,
  wordCount,
  charCount,
}) => {

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onChange(text ? `${text}\n${clipboardText}` : clipboardText);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleSampleClick = (sampleText: string) => {
    onChange(sampleText);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-[#7DA7D9]/25 flex flex-col h-full shadow-[0_8px_32px_rgba(47,72,96,0.10)] bg-white/90">
      
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#7DA7D9]/20">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-[#5b8cc4]" />
          <h2 className="text-sm font-semibold text-[#2F4860] tracking-wide">Text Input Editor</h2>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-3 text-xs text-[#2F4860]/70 font-mono">
          <span className="px-2 py-0.5 rounded-md bg-[#DCEEFF]/60 border border-[#7DA7D9]/30">
            <strong className="text-[#2F4860]">{wordCount}</strong> words
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#DCEEFF]/60 border border-[#7DA7D9]/30">
            <strong className="text-[#2F4860]">{charCount}</strong> chars
          </span>
        </div>
      </div>

      {/* Preset Sample Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-[#2F4860]/60 font-medium mr-1">Load Samples:</span>
        {SAMPLE_TEXTS.map(sample => (
          <button
            key={sample.id}
            type="button"
            onClick={() => handleSampleClick(sample.text)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              sample.type === 'AI'
                ? 'bg-[#7DA7D9]/15 hover:bg-[#7DA7D9]/25 border-[#7DA7D9]/40 text-[#2F4860]'
                : sample.type === 'Human'
                ? 'bg-[#e8d9ed]/50 hover:bg-[#e8d9ed] border-[#b694c7]/40 text-[#2F4860]'
                : 'bg-[#FFF7CC] hover:bg-[#ffef99] border-[#7DA7D9]/30 text-[#2F4860]'
            }`}
            title={sample.description}
          >
            + {sample.title}
          </button>
        ))}
      </div>

      {/* Textarea Input */}
      <div className="relative flex-1 min-h-[220px] lg:min-h-[280px]">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or write text here to analyze for AI patterns... (Minimum 25 words recommended for highest accuracy)"
          className="w-full h-full p-4 text-sm text-[#2F4860] bg-white rounded-xl border border-[#7DA7D9]/30 focus:border-[#5b8cc4] focus:ring-2 focus:ring-[#7DA7D9]/25 outline-none resize-none transition-all placeholder:text-[#2F4860]/40 leading-relaxed font-sans"
        />

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {!text && (
            <button
              onClick={handlePaste}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#2F4860] bg-[#DCEEFF]/80 hover:bg-[#DCEEFF] border border-[#7DA7D9]/40 rounded-lg shadow-sm transition-all"
            >
              <Clipboard className="w-3.5 h-3.5 text-[#5b8cc4]" />
              Paste Clipboard
            </button>
          )}

          {text && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#2F4860] bg-[#FFF7CC] hover:bg-[#ffef99] border border-[#7DA7D9]/30 rounded-lg shadow-sm transition-all"
              title="Clear editor text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-[#2F4860]/55">
          Supports multi-paragraph essays, articles, and research drafts.
        </p>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || !text.trim()}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
            isAnalyzing || !text.trim()
              ? 'bg-[#DCEEFF]/60 border border-[#7DA7D9]/20 text-[#2F4860]/40 cursor-not-allowed shadow-none'
              : 'bg-[#2F4860] hover:bg-[#3d5c7a] text-white border border-[#2F4860] font-semibold shadow-[0_4px_18px_rgba(47,72,96,0.30)] active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Analyzing Content...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#FFF7CC] animate-pulse" />
              <span>Analyze Content</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
