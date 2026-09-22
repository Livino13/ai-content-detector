'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface FileUploadZoneProps {
  onTextExtracted: (text: string, fileName: string) => void;
  isAnalyzing: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onTextExtracted,
  isAnalyzing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: string; wordCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const processFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to extract text from file.');
      }

      setCurrentFile({
        name: data.fileName,
        size: formatBytes(data.fileSize),
        wordCount: data.wordCount,
      });

      onTextExtracted(data.text, data.fileName);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-[#7DA7D9]/25 shadow-[0_8px_32px_rgba(47,72,96,0.10)] flex flex-col justify-between bg-white/90">
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#7DA7D9]/20">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#5b8cc4]" />
            <h2 className="text-sm font-semibold text-[#2F4860] tracking-wide">Document Upload Analysis</h2>
          </div>
          <span className="text-[11px] text-[#2F4860] font-medium px-2 py-0.5 rounded-full bg-[#FFF7CC] border border-[#7DA7D9]/30">PDF, DOCX, TXT, MD</span>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#5b8cc4] bg-[#7DA7D9]/15 scale-[1.01]'
              : 'border-[#7DA7D9]/35 bg-[#DCEEFF]/30 hover:border-[#5b8cc4] hover:bg-[#DCEEFF]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-[#5b8cc4] animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white border border-[#7DA7D9]/40 flex items-center justify-center text-[#5b8cc4] shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
            )}

            <p className="text-xs text-[#2F4860] font-medium mt-1">
              {isUploading ? 'Extracting document text...' : 'Drag & drop your document here, or click to browse'}
            </p>
            <p className="text-[11px] text-[#2F4860]/60">
              Supports Word (.docx), Acrobat (.pdf), Plain Text (.txt, .md) up to 25MB
            </p>
          </div>
        </div>

        {/* Error message */}
        {uploadError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Active Loaded File Info */}
        {currentFile && !isUploading && (
          <div className="mt-3 p-3 rounded-xl bg-[#DCEEFF]/50 border border-[#7DA7D9]/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <CheckCircle2 className="w-4 h-4 text-[#2F4860] shrink-0" />
              <div className="truncate">
                <p className="text-[#2F4860] font-medium truncate">{currentFile.name}</p>
                <p className="text-[10px] text-[#2F4860]/60">
                  {currentFile.size} • {currentFile.wordCount} words extracted
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentFile(null);
              }}
              className="text-[#2F4860]/50 hover:text-[#2F4860] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
