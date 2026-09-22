'use client';

import React from 'react';
import { Bot, History, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onReset: () => void;
  historyCount: number;
  hasInput: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onReset,
  historyCount,
  hasInput,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-[#7DA7D9]/25 px-4 lg:px-8 py-3.5 shadow-[0_2px_20px_rgba(47,72,96,0.08)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2F4860] via-[#5b8cc4] to-[#7DA7D9] shadow-[0_0_20px_rgba(125,167,217,0.45)] border border-[#7DA7D9]/40">
            <Bot className="w-5 h-5 text-[#FFF7CC]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE366] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFE366] border border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#2F4860] tracking-wide">
                VeriTextAI
              </h1>
            </div>
            <p className="text-xs text-[#2F4860]/65 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5b8cc4]" />
              AI Content Detector &amp; Stylometrics Analyzer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#2F4860] bg-white hover:bg-[#DCEEFF]/60 border border-[#7DA7D9]/30 rounded-xl transition-all shadow-sm"
            title="View Analysis History"
          >
            <History className="w-4 h-4 text-[#5b8cc4]" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#2F4860] text-white">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset Button */}
          {hasInput && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2F4860] bg-[#FFF7CC]/60 hover:bg-[#FFF7CC] border border-[#7DA7D9]/30 rounded-xl transition-all"
              title="Reset Editor & Results"
            >
              <RotateCcw className="w-4 h-4 text-[#5b8cc4] hover:rotate-[-90deg] transition-transform" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
