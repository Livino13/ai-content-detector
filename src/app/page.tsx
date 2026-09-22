'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TextEditor } from '@/components/TextEditor';
import { FileUploadZone } from '@/components/FileUploadZone';
import { AnalysisResults } from '@/components/AnalysisResults';
import { SentenceHeatmap } from '@/components/SentenceHeatmap';
import { TextStatsCard } from '@/components/TextStatsCard';
import { HistorySidebar } from '@/components/HistorySidebar';
import { DetectionResult, HistoryItem } from '@/lib/types';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState<string>('');
  const [activeFileName, setActiveFileName] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<DetectionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage on mount
  // (falls back to legacy 'veritasai_*' keys from before the VeriTextAI rename)
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('veritextai_history') ?? localStorage.getItem('veritasai_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      // Clean up legacy keys from the removed engine/model settings.
      localStorage.removeItem('veritextai_hf_key');
      localStorage.removeItem('veritasai_hf_key');
      localStorage.removeItem('veritextai_model');
      localStorage.removeItem('veritasai_model');
      localStorage.removeItem('veritextai_engine');
    } catch (err) {
      console.warn('LocalStorage read error:', err);
    }
  }, []);

  // Save history helper
  const saveHistoryItem = (result: DetectionResult) => {
    const newItem: HistoryItem = {
      id: result.id,
      timestamp: result.timestamp,
      classification: result.classification,
      aiProbability: result.aiProbability,
      textSnippet: result.textSnippet,
      fullText: result.fullText,
      wordCount: result.statistics.wordCount,
      fileName: result.fileName,
    };
    const updated = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, 30);
    setHistory(updated);
    try {
      localStorage.setItem('veritextai_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('veritextai_history');
      localStorage.removeItem('veritasai_history');
    } catch (e) {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem('veritextai_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleTextExtracted = (extractedText: string, fileName: string) => {
    setText(extractedText);
    setActiveFileName(fileName);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setText('');
    setActiveFileName(undefined);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  const handleRunAnalysis = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          // Gemini judge first, local stylometric engine as automatic fallback.
          engine: 'gemini',
          sourceType: activeFileName ? 'file' : 'text',
          fileName: activeFileName,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to complete content detection.');
      }

      const result: DetectionResult = data;
      setAnalysisResult(result);
      saveHistoryItem(result);
    } catch (err: any) {
      console.error('Detection execution error:', err);
      setErrorMessage(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Live basic counters
  const wordsArr = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = wordsArr.length;
  const charCount = text.length;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Navigation Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleReset}
        historyCount={history.length}
        hasInput={Boolean(text || analysisResult)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Hero Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7CC]/95 border border-white/40 text-[#2F4860] text-xs font-medium shadow-[0_2px_18px_rgba(255,247,204,0.35)] backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#5b8cc4]" />
            NLP Stylometric & Transformer Content Classification
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2F4860] tracking-tight leading-tight drop-shadow-[0_1px_12px_rgba(255,255,255,0.9)]">
            AI-Generated Content Detection System
          </h1>
          <p className="text-sm text-[#2F4860]/80 drop-shadow-[0_1px_8px_rgba(255,255,255,0.9)]">
            Paste your article, essay, or upload PDF and Word documents to verify authenticity, review confidence scores, and inspect sentence-level heatmaps.
          </p>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-3 animate-fadeIn max-w-4xl mx-auto shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold underline hover:text-[#2F4860]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Input Grid: Editor & File Dropzone */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TextEditor
              text={text}
              onChange={(val) => {
                setText(val);
                if (errorMessage) setErrorMessage(null);
              }}
              onAnalyze={handleRunAnalysis}
              onClear={handleReset}
              isAnalyzing={isAnalyzing}
              wordCount={wordCount}
              charCount={charCount}
            />
          </div>

          <div className="lg:col-span-1">
            <FileUploadZone
              onTextExtracted={handleTextExtracted}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        {/* Analysis Results Section */}
        {analysisResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Classification & Donut Meter */}
            <AnalysisResults result={analysisResult} />

            {/* Sentence Heatmap */}
            <SentenceHeatmap sentences={analysisResult.sentences} />

            {/* Text Statistics Card */}
            <TextStatsCard stats={analysisResult.statistics} />
          </div>
        )}

      </main>

      {/* Slide-over History Drawer */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setText(item.fullText);
          setActiveFileName(item.fileName);
          setAnalysisResult(null);
        }}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-[#7DA7D9]/25 py-6 px-4 text-center text-xs text-[#2F4860]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#5b8cc4]" />
            <span>VeriTextAI Detection System &copy; 2026</span>
          </div>
          <p className="text-[11px] text-[#2F4860]/55">
            Local Stylometric Engine &amp; server-side Gemini AI judge
          </p>
        </div>
      </footer>

    </div>
  );
}
