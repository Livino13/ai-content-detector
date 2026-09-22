'use client';

import React from 'react';
import { DetectionResult } from '@/lib/types';
import { ShieldCheck, AlertTriangle, Cpu, HelpCircle, Activity, Zap } from 'lucide-react';

interface AnalysisResultsProps {
  result: DetectionResult;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const { classification, aiProbability, humanProbability, uncertainProbability, confidence, modelUsed, stylometrics } = result;

  // Color mappings based on classification
  const isAI = classification === 'AI-Generated';
  const isHuman = classification === 'Human-Written';
  const isUncertain = classification === 'Uncertain';

  const badgeConfig = isAI
    ? {
        label: 'AI-Generated Content',
        bgColor: 'bg-[#7DA7D9]/15',
        borderColor: 'border-[#5b8cc4]/40',
        textColor: 'text-[#2F4860]',
        glowColor: 'shadow-[0_0_20px_rgba(125,167,217,0.30)]',
        icon: <Cpu className="w-5 h-5 text-[#2F4860] animate-pulse" />,
      }
    : isHuman
    ? {
        label: 'Human-Written Content',
        bgColor: 'bg-[#DCEEFF]/60',
        borderColor: 'border-[#7DA7D9]/40',
        textColor: 'text-[#2F4860]',
        glowColor: 'shadow-[0_0_20px_rgba(125,167,217,0.20)]',
        icon: <ShieldCheck className="w-5 h-5 text-[#2F4860]" />,
      }
    : {
        label: 'Uncertain / Mixed Content',
        bgColor: 'bg-[#FFF7CC]',
        borderColor: 'border-[#7DA7D9]/40',
        textColor: 'text-[#2F4860]',
        glowColor: 'shadow-[0_0_20px_rgba(255,247,204,0.6)]',
        icon: <HelpCircle className="w-5 h-5 text-[#2F4860]" />,
      };

  // Circular progress calculation (SVG stroke-dasharray)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (aiProbability / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-[#7DA7D9]/25 shadow-[0_8px_32px_rgba(47,72,96,0.10)] space-y-6 bg-white/90">
      
      {/* Classification Header Banner */}
      <div className={`p-4 rounded-xl border ${badgeConfig.bgColor} ${badgeConfig.borderColor} ${badgeConfig.glowColor} flex flex-wrap items-center justify-between gap-4 transition-all`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-white border border-[#7DA7D9]/30 shadow-sm">
            {badgeConfig.icon}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${badgeConfig.textColor} tracking-wide`}>
              {badgeConfig.label}
            </h3>
            <p className="text-xs text-[#2F4860]/65">
              Detector Model: <span className="font-mono text-[#2F4860] font-semibold">{modelUsed}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#2F4860]/55 block">Overall Confidence</span>
          <span className={`text-2xl font-black ${badgeConfig.textColor} font-mono`}>
            {confidence}%
          </span>
        </div>
      </div>

      {/* Radial Meter & Probability Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* SVG Radial AI Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#DCEEFF]/40 rounded-xl border border-[#7DA7D9]/25">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                className="text-white"
                fill="transparent"
              />
              {/* Progress Bar */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${
                  aiProbability > 50 ? 'text-[#5b8cc4]' : aiProbability < 40 ? 'text-[#2F4860]' : 'text-[#c9a800]'
                }`}
                fill="transparent"
              />
            </svg>

            {/* Central Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-[#2F4860] font-mono">{aiProbability}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F4860]/70 bg-[#FFF7CC] px-2 py-0.5 rounded-full border border-[#7DA7D9]/30">AI Probability</span>
            </div>
          </div>
        </div>

        {/* Probability Breakdown Stack */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-[#2F4860] flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> AI Probability
              </span>
              <span className="text-[#2F4860] font-mono font-bold">{aiProbability}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#DCEEFF]/60 rounded-full overflow-hidden border border-[#7DA7D9]/25">
              <div
                className="h-full bg-gradient-to-r from-[#2F4860] to-[#7DA7D9] transition-all duration-700"
                style={{ width: `${aiProbability}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-[#2F4860] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Human Probability
              </span>
              <span className="text-[#2F4860] font-mono font-bold">{humanProbability}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#e8d9ed]/50 rounded-full overflow-hidden border border-[#b694c7]/30">
              <div
                className="h-full bg-gradient-to-r from-[#b694c7] to-[#e8d9ed] transition-all duration-700"
                style={{ width: `${humanProbability}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-[#2F4860] flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Uncertain / Mixed
              </span>
              <span className="text-[#2F4860] font-mono font-bold">{uncertainProbability}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#FFF7CC]/70 rounded-full overflow-hidden border border-[#7DA7D9]/25">
              <div
                className="h-full bg-gradient-to-r from-[#ffe366] to-[#FFF7CC] transition-all duration-700 border-r border-[#7DA7D9]/30"
                style={{ width: `${uncertainProbability}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Stylometrics Analysis Bar */}
      <div className="pt-4 border-t border-[#7DA7D9]/20">
        <h4 className="text-xs font-semibold text-[#2F4860] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-[#5b8cc4]" /> Stylometric Features
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFF7CC]/60 border border-[#7DA7D9]/25">
            <span className="text-[10px] text-[#2F4860]/60 block">Burstiness</span>
            <span className="text-sm font-bold text-[#2F4860] font-mono">{stylometrics.burstiness}</span>
            <span className="text-[9px] text-[#2F4860]/50 block">Length variance</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#7DA7D9]/10 border border-[#7DA7D9]/25">
            <span className="text-[10px] text-[#2F4860]/60 block">Perplexity</span>
            <span className="text-sm font-bold text-[#2F4860] font-mono">{stylometrics.perplexity}</span>
            <span className="text-[9px] text-[#2F4860]/50 block">Word entropy</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#DCEEFF]/50 border border-[#7DA7D9]/25">
            <span className="text-[10px] text-[#2F4860]/60 block">Vocabulary Diversity</span>
            <span className="text-sm font-bold text-[#2F4860] font-mono">{Math.round(stylometrics.vocabularyRichness * 100)}%</span>
            <span className="text-[9px] text-[#2F4860]/50 block">Unique ratio</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FFF7CC]/60 border border-[#7DA7D9]/25">
            <span className="text-[10px] text-[#2F4860]/60 block">Repetitiveness</span>
            <span className="text-sm font-bold text-[#2F4860] font-mono">{Math.round(stylometrics.repetitiveness * 100)}%</span>
            <span className="text-[9px] text-[#2F4860]/50 block">Pattern reuse</span>
          </div>
        </div>
      </div>

    </div>
  );
};
