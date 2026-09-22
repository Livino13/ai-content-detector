export type ClassificationResult = 'AI-Generated' | 'Human-Written' | 'Uncertain';

export interface SentenceCalcStep {
  label: string;
  delta: number; // signed contribution to the 0-1 score (e.g. +0.16, -0.22)
  runningScore: number; // score after applying this step (0-1)
  detail: string; // human-readable explanation of this step
}

export interface SentenceScore {
  text: string;
  score: number; // 0 to 1 (0 = 100% human, 1 = 100% AI)
  classification: ClassificationResult;
  aiProbability: number; // percentage (0 - 100)
  humanProbability: number; // percentage (0 - 100)
  uncertainProbability: number; // percentage (0 - 100)
  steps?: SentenceCalcStep[]; // step-by-step derivation of the score
  judgeScore?: number | null; // raw Gemini judge score when available (0-1)
  localScore?: number | null; // local stylometric score before blending (0-1)
}

export interface TextStatistics {
  wordCount: number;
  characterCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  readingTimeMinutes: number;
}

export interface StylometricMetrics {
  perplexity: number;
  burstiness: number;
  vocabularyRichness: number;
  repetitiveness: number;
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  classification: ClassificationResult;
  aiProbability: number; // percentage (0 - 100)
  humanProbability: number; // percentage (0 - 100)
  uncertainProbability: number; // percentage (0 - 100)
  confidence: number; // percentage (0 - 100)
  modelUsed: string;
  sentences: SentenceScore[];
  statistics: TextStatistics;
  stylometrics: StylometricMetrics;
  textSnippet: string;
  fullText: string;
  sourceType: 'text' | 'file';
  fileName?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  classification: ClassificationResult;
  aiProbability: number;
  textSnippet: string;
  fullText: string;
  wordCount: number;
  fileName?: string;
}
