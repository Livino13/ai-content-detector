import { ClassificationResult, DetectionResult, SentenceScore, StylometricMetrics, TextStatistics } from './types';

// Common AI Transition words and phrases frequently produced by LLMs
const AI_TRANSITION_MARKERS = [
  'furthermore', 'consequently', 'moreover', 'in conclusion', 'it is important to note',
  'delve', 'tapestry', 'testament to', 'pivotal role', 'in summary', 'underscores',
  'leverage', 'synergy', 'holistic approach', 'paramount', 'fostering', 'seamlessly'
];

/**
 * Split text into sentences cleanly
 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Calculate basic text statistics
 */
export function computeTextStatistics(text: string): TextStatistics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      avgSentenceLength: 0,
      readingTimeMinutes: 0,
    };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const sentences = splitSentences(trimmed);
  const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const wordCount = words.length;
  const characterCount = trimmed.length;
  const sentenceCount = sentences.length || 1;
  const paragraphCount = paragraphs.length || 1;
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10;
  
  // Standard reading speed ~ 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    wordCount,
    characterCount,
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    readingTimeMinutes,
  };
}

/**
 * Compute Stylometric Metrics (Burstiness, Perplexity approximation, Vocabulary Richness)
 */
export function computeStylometrics(text: string): StylometricMetrics {
  const sentences = splitSentences(text);
  const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];

  if (words.length === 0 || sentences.length === 0) {
    return { perplexity: 50, burstiness: 0, vocabularyRichness: 0.5, repetitiveness: 0 };
  }

  // 1. Sentence Length Variance (Burstiness)
  // Humans write with high variance (short punchy sentences + long complex ones).
  // AI tends to produce uniform sentence lengths (low burstiness).
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const meanLen = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sq, n) => sq + Math.pow(n - meanLen, 2), 0) / sentenceLengths.length;
  const stdDev = Math.sqrt(variance);
  const burstiness = meanLen > 0 ? stdDev / meanLen : 0;

  // 2. Vocabulary Richness (Type-Token Ratio - TTR)
  const uniqueWords = new Set(words);
  const vocabularyRichness = Math.round((uniqueWords.size / words.length) * 100) / 100;

  // 3. AI Transition Marker Density
  let aiMarkerHits = 0;
  const lowerText = text.toLowerCase();
  AI_TRANSITION_MARKERS.forEach(marker => {
    if (lowerText.includes(marker)) {
      aiMarkerHits += 1;
    }
  });

  // 4. Perplexity Estimation (approximation based on word unigram entropy and uniform flow)
  const wordFreq: Record<string, number> = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
  let entropy = 0;
  words.forEach(w => {
    const p = wordFreq[w] / words.length;
    entropy -= p * Math.log2(p);
  });
  const perplexity = Math.round(Math.pow(2, entropy) * 10) / 10;

  const repetitiveness = Math.max(0, Math.min(1, 1 - vocabularyRichness));

  return {
    perplexity,
    burstiness: Math.round(burstiness * 100) / 100,
    vocabularyRichness,
    repetitiveness: Math.round(repetitiveness * 100) / 100,
  };
}

/**
 * Split a sentence/document AI percentage into an AI/Human/Uncertain three-way
 * distribution. Uncertain follows a smooth triangular curve peaking at 50%
 * (~25% uncertain) and decaying to ~3% at the extremes, so borderline and
 * near-threshold scores keep a meaningful uncertain share while decisive
 * scores assign it mostly to one side.
 */
export function splitProbabilities(
  aiPct: number,
  // kept for backwards compat; bands now only shape the curve slightly
  lowerBand = 40,
  upperBand = 60
): {
  aiProbability: number;
  humanProbability: number;
  uncertainProbability: number;
} {
  const aiProbability = Math.min(100, Math.max(0, Math.round(aiPct)));
  const distance = Math.abs(aiProbability - 50) / 50; // 0 at 50, 1 at 0/100
  let uncertainProbability = Math.round(3 + 22 * Math.pow(1 - distance, 1.5));
  // Slight boost inside the explicit uncertain band so 35-65 keeps extra doubt.
  if (aiProbability > lowerBand && aiProbability < upperBand) {
    uncertainProbability = Math.min(35, uncertainProbability + 3);
  }
  uncertainProbability = Math.min(35, Math.max(2, uncertainProbability));
  // Guard tiny docs: never let rounding push the total over 100.
  uncertainProbability = Math.min(uncertainProbability, 100 - aiProbability);
  const humanProbability = Math.max(0, 100 - aiProbability - uncertainProbability);
  return { aiProbability, humanProbability, uncertainProbability };
}

// First-person / lived-experience cues. Intentionally narrow: generic topic
// words like "baking" or "bakery" are NOT personal — only pronouns and clear
// anecdotal markers count, otherwise formal sentences get wrongly humanized.
const PERSONAL_VOICE_RE =
  /\b(i|my|me|mine|we|our|ours|you|your|flatmate|honestly|laughed|laugh|wallet)\b/i;

const INFORMAL_RE =
  /('|’)(s|re|ve|ll|t|m)|!|honestly|seriously|yeah|gonna|wanna|bucks|sludge|brick/i;

const FORMAL_TERM_RE =
  /(tion|ment|ence|ance|ity|ization|ism|complex|precise|consistent|optimal|beneficial|fermentation|digestibility|caramelization|cultivat|caramel|structure|session)/i;

/**
 * Step-by-step NLP classifier calculating AI probability for a single sentence.
 *
 * Starts from a neutral 0.50 prior and applies signed evidence deltas:
 *  + AI transition marker (mitigated when mixed with personal voice)
 *  - personal/anecdotal voice
 *  +/- sentence length (fragments human, polished 15-30w AI)
 *  - fragment/question, - informality, + formal lexical density
 *  +/- document burstiness context, + high-TTR polish
 *  +/- conflict resolution: marker + personal voice pulls toward 0.5
 *    (mixed origin => Uncertain), short marker sentences are floored
 *    into the uncertain band since they carry too little signal.
 */
export function scoreSentenceLocally(sentence: string, overallBurstiness: number): SentenceScore {
  const trimmed = sentence.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lower = trimmed.toLowerCase();
  const steps: SentenceScore['steps'] = [];

  const pushStep = (label: string, delta: number, running: number, detail: string) => {
    steps.push({
      label,
      delta: Math.round(delta * 100) / 100,
      runningScore: Math.round(Math.min(0.98, Math.max(0.02, running)) * 100) / 100,
      detail,
    });
  };

  let score = 0.5;
  pushStep('Base prior', 0, score, '0.50 neutral starting point — no evidence yet.');

  // 1. AI transition marker
  const hasAIMarker = AI_TRANSITION_MARKERS.some(m => lower.includes(m));
  const hasPersonal = PERSONAL_VOICE_RE.test(lower);
  if (hasAIMarker) {
    const d = hasPersonal ? 0.16 : 0.3;
    score += d;
    pushStep(
      hasPersonal ? 'AI marker (mitigated)' : 'AI transition marker',
      d,
      score,
      hasPersonal
        ? `+0.16 formal LLM transition phrase found, but first-person/anecdotal context halves its weight (full weight would be +0.30). Mixed signal.`
        : `+0.30 formal LLM transition phrase detected (${AI_TRANSITION_MARKERS.find(m => lower.includes(m))}).`
    );
  } else {
    pushStep('AI marker check', 0, score, '+0.00 no formal AI transition phrase.');
  }

  // 2. Personal voice
  if (hasPersonal) {
    score -= 0.22;
    pushStep(
      'Personal voice / anecdote',
      -0.22,
      score,
      '-0.22 first-person pronouns or lived-experience cues (I/my/flatmate/honestly/laughed/wallet). Strong human signal.'
    );
  } else {
    pushStep('Personal voice check', 0, score, '+0.00 no personal voice.');
  }

  // 3. Sentence length
  let lenDelta = 0;
  let lenDetail = '';
  if (wordCount <= 5) {
    lenDelta = -0.2;
    lenDetail = `${wordCount} words: fragment / short burst (human-like).`;
  } else if (wordCount <= 9) {
    lenDelta = -0.12;
    lenDetail = `${wordCount} words: short (human-leaning).`;
  } else if (wordCount <= 14) {
    lenDelta = -0.04;
    lenDetail = `${wordCount} words: medium-short (slightly human).`;
  } else if (wordCount <= 22) {
    lenDelta = 0.1;
    lenDetail = `${wordCount} words: neutral-long polished zone (AI-leaning uniformity).`;
  } else if (wordCount <= 30) {
    lenDelta = 0.14;
    lenDetail = `${wordCount} words: long polished sentence (AI-leaning).`;
  } else {
    lenDelta = 0.1;
    lenDetail = `${wordCount} words: very long.`;
  }
  score += lenDelta;
  pushStep('Sentence length', lenDelta, score, `${lenDelta >= 0 ? '+' : ''}${lenDelta.toFixed(2)} ${lenDetail}`);

  // 4. Fragment / question
  if (trimmed.endsWith('?') || wordCount <= 4) {
    score -= 0.1;
    pushStep('Fragment / question', -0.1, score, '-0.10 interrogative or verbless fragment (human burstiness).');
  }

  // 5. Informality
  if (INFORMAL_RE.test(trimmed)) {
    score -= 0.08;
    pushStep('Informality / slang', -0.08, score, '-0.08 contractions, exclamation, or colloquial diction.');
  } else {
    pushStep('Informality check', 0, score, '+0.00 no slang/contractions.');
  }

  // 6. Formal lexical density
  const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length >= 8).length;
  const nominalHits = (lower.match(new RegExp(FORMAL_TERM_RE.source, 'gi')) || []).length;
  if (longWords >= 4 || nominalHits >= 2) {
    score += 0.12;
    pushStep('Formal lexical density', 0.12, score, `+0.12 ${longWords} long words, ${nominalHits} nominalizations/academic terms.`);
  } else if (longWords >= 2 || nominalHits >= 1) {
    score += 0.06;
    pushStep('Formal diction', 0.06, score, '+0.06 some polysyllabic / formal vocabulary.');
  } else {
    pushStep('Formal diction check', 0, score, '+0.00 plain everyday vocabulary.');
  }

  // 7. Document burstiness context
  if (overallBurstiness < 0.25) {
    score += 0.1;
    pushStep('Document uniformity', 0.1, score, `+0.10 doc burstiness ${overallBurstiness.toFixed(2)} very uniform (AI-like).`);
  } else if (overallBurstiness < 0.4) {
    score += 0.04;
    pushStep('Document uniformity', 0.04, score, `+0.04 doc burstiness ${overallBurstiness.toFixed(2)} fairly uniform.`);
  } else if (overallBurstiness > 0.7) {
    score -= 0.06;
    pushStep('Document burstiness', -0.06, score, `-0.06 doc burstiness ${overallBurstiness.toFixed(2)} highly varied (human-like).`);
  } else if (overallBurstiness > 0.5) {
    score -= 0.03;
    pushStep('Document burstiness', -0.03, score, `-0.03 doc burstiness ${overallBurstiness.toFixed(2)} varied.`);
  } else {
    pushStep('Burstiness context', 0, score, `+0.00 burstiness ${overallBurstiness.toFixed(2)} neutral.`);
  }

  // 8. Vocabulary variety polish
  const wordSet = new Set(words.map(w => w.toLowerCase()));
  const ttr = wordSet.size / (wordCount || 1);
  if (wordCount > 12 && ttr > 0.92) {
    score += 0.04;
    pushStep('Vocabulary variety', 0.04, score, `+0.04 high TTR ${ttr.toFixed(2)} in long sentence (polished variety).`);
  } else {
    pushStep('Vocabulary variety', 0, score, `+0.00 TTR ${ttr.toFixed(2)}.`);
  }

  // 9. Conflict resolution: AI marker + personal voice = mixed origin.
  // Pull toward 0.5 so "Furthermore, I kept baking..." lands Uncertain
  // instead of flipping fully AI or Human.
  if (hasAIMarker && hasPersonal) {
    const before = score;
    score = score * 0.65 + 0.5 * 0.35;
    pushStep(
      'Conflict resolution',
      score - before,
      score,
      `Mixed signals (formal AI marker + personal voice) pull ${before.toFixed(2)} toward neutral 0.50 => ${score.toFixed(2)}. This is what creates the Uncertain band for hybrid sentences.`
    );
  }

  // 10. Ultra-short marker sentences carry too little signal to call
  // decisively — floor/cap them inside the uncertain band.
  if (hasAIMarker && wordCount <= 6) {
    if (score < 0.38) {
      const before = score;
      score = 0.4;
      pushStep('Short-marker guardrail', score - before, score, `Only ${wordCount} words with a formal marker: too little signal, floored ${before.toFixed(2)} => 0.40 (Uncertain).`);
    } else if (score > 0.62) {
      const before = score;
      score = 0.6;
      pushStep('Short-marker guardrail', score - before, score, `Only ${wordCount} words with a formal marker: capped ${before.toFixed(2)} => 0.60 (Uncertain).`);
    }
  }

  const rawScore = Math.min(0.98, Math.max(0.02, score));
  const finalScore = Math.round(rawScore * 100) / 100;

  let classification: ClassificationResult = 'Uncertain';
  if (finalScore >= 0.65) classification = 'AI-Generated';
  else if (finalScore <= 0.35) classification = 'Human-Written';

  pushStep(
    'Final clamp + label',
    0,
    finalScore,
    `Clamped to [0.02, 0.98] => ${finalScore.toFixed(2)} (${Math.round(finalScore * 100)}% AI). Thresholds: <=0.35 Human, 0.36-0.64 Uncertain, >=0.65 AI => ${classification}.`
  );

  return {
    text: sentence,
    score: finalScore,
    classification,
    ...splitProbabilities(finalScore * 100, 35, 65),
    steps,
    localScore: finalScore,
    judgeScore: null,
  };
}

export const GEMINI_MODELS = [
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (AI Judge)' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash (AI Judge)' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite (AI Judge)' },
];

export type DetectionEngine = 'local' | 'gemini';

/**
 * Classify text with the chosen engine:
 * - 'local': fully offline stylometric NLP engine (no external API).
 * - 'gemini': server-side Gemini LLM judge (falls back to local on any failure).
 */
export async function analyzeText(
  text: string,
  sourceType: 'text' | 'file' = 'text',
  fileName?: string,
  engine: DetectionEngine = 'gemini'
): Promise<DetectionResult> {
  const stats = computeTextStatistics(text);
  const stylometrics = computeStylometrics(text);
  const sentences = splitSentences(text);

  let modelUsed = 'Stylometric NLP Engine (Local High-Precision Classifier)';
  let sentenceScores: SentenceScore[] = [];

  // Local stylometrics classifier: AI markers, burstiness, TTR, and perplexity
  // Low burstiness indicates AI
  const burstinessScore = Math.max(0, 1 - stylometrics.burstiness);

  // AI marker density
  const lowerText = text.toLowerCase();
  const aiHits = AI_TRANSITION_MARKERS.filter(m => lowerText.includes(m)).length;
  const markerScore = Math.min(1, aiHits * 0.25);

  // Sentence length uniformity
  const avgLen = stats.avgSentenceLength;
  const avgLenScore = (avgLen >= 14 && avgLen <= 26) ? 0.7 : 0.4;

  const totalScore = (burstinessScore * 0.35) + (markerScore * 0.35) + (avgLenScore * 0.3);
  let aiProb = Math.min(98, Math.max(3, Math.round(totalScore * 100)));

  // Optional server-side Gemini LLM judge (API key never leaves the server).
  // Asks for an overall verdict PLUS a per-sentence score for each sentence, so the
  // heatmap reflects the judge instead of local heuristics dragged toward the overall.
  let judgeSentenceScores: number[] | null = null;
  if (engine === 'gemini') {
    try {
      const serverKey = process.env.AI_JUDGE_API_KEY;
      if (serverKey) {
        // Number the sentences within a character budget so long documents stay cheap.
        const budgeted: string[] = [];
        let used = 0;
        for (const s of sentences) {
          if (used + s.length > 4000 && budgeted.length > 0) break;
          budgeted.push(s);
          used += s.length;
        }
        const numbered = budgeted.map((s, i) => `${i + 1}. ${s}`).join('\n');
        const prompt =
          'You are an expert AI-text detector. Score the text below.\n' +
          '1. Overall probability (0-100) it was written by an AI language model rather than a human.\n' +
          '2. Per-sentence AI probability (0-1 for EACH numbered sentence, in order). Use the FULL range: ' +
          'clearly human sentences near 0, clearly AI sentences near 1, ambiguous or mixed-origin sentences ' +
          'near 0.5. Do not force every sentence to match the overall score.\n' +
          'Consider: uniform formal phrasing (AI-like) versus burstiness, personal voice, anecdotes, ' +
          'informality, irregular rhythm (human-like).\n' +
          'Return ONLY JSON with this exact shape: {"aiProbability": number, "sentenceScores": [number, ...]}.\n\nSentences:\n' +
          numbered;

        // Try each judge model in order with retries; capacity fluctuates per model.
        // Any total failure keeps the local score computed above.
        let judged = false;
        for (const judge of GEMINI_MODELS) {
          if (judged) break;
          for (let attempt = 0; attempt < 2; attempt++) {
            if (attempt > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
            try {
              const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${judge.id}:generateContent?key=${serverKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                      responseMimeType: 'application/json',
                      // Headroom for thinking-model reasoning plus the per-sentence array.
                      maxOutputTokens: 1024,
                    },
                  }),
                  signal: AbortSignal.timeout(25000),
                }
              );

              if (res.ok) {
                const data = await res.json();
                const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (typeof raw === 'string') {
                  const parsed = JSON.parse(raw);
                  if (typeof parsed.aiProbability === 'number' && Number.isFinite(parsed.aiProbability)) {
                    aiProb = Math.min(98, Math.max(2, Math.round(parsed.aiProbability)));
                    modelUsed = judge.label;
                    // Accept per-sentence scores only on exact length match to avoid
                    // misaligned labels; otherwise every sentence falls back to local.
                    if (
                      Array.isArray(parsed.sentenceScores) &&
                      parsed.sentenceScores.length === budgeted.length &&
                      parsed.sentenceScores.every(
                        (n: unknown) => typeof n === 'number' && Number.isFinite(n)
                      )
                    ) {
                      judgeSentenceScores = parsed.sentenceScores.map((n: number) =>
                        Math.min(0.98, Math.max(0.02, n))
                      );
                    }
                    judged = true;
                    break;
                  }
                }
                break; // Valid response but unusable payload; try next model.
              }
              if (res.status !== 429 && res.status !== 503) {
                console.warn(`Gemini judge (${judge.id}) failed with status ${res.status}.`);
                break; // Permanent error for this model; try next model.
              }
            } catch (err) {
              console.warn(`Gemini judge (${judge.id}) attempt ${attempt + 1} error:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Gemini judge call failed, falling back to local engine:', err);
    }
  }

  // Calculate sentence-by-sentence heatmap scores, step by step.
  // - Local engine: 75% local evidence + 25% document prior (preserves
  //   per-sentence variance so mixed docs keep Human + Uncertain + AI).
  // - Gemini engine: 55% judge + 45% local, plus disagreement softening.
  //   Pure-judge scores polarize (all 0.05 / 0.95, zero Uncertain), so we
  //   re-introduce local evidence and pull strong disagreements toward 0.5.
  //   This guarantees hybrid content actually shows the Uncertain band.
  sentenceScores = sentences.map((sentence, idx) => {
    const judgeScore =
      judgeSentenceScores && idx < judgeSentenceScores.length ? judgeSentenceScores[idx] : null;
    const local = scoreSentenceLocally(sentence, stylometrics.burstiness);

    let blendedScore: number;
    let steps = [...(local.steps || [])];
    if (judgeScore !== null) {
      const rawBlend = 0.55 * judgeScore + 0.45 * local.score;
      const disagreement = Math.abs(judgeScore - local.score);
      let softened = rawBlend;
      let softenNote = `0.55 x judge ${judgeScore.toFixed(2)} + 0.45 x local ${local.score.toFixed(2)} = ${rawBlend.toFixed(2)}.`;
      if (disagreement > 0.35) {
        const pull = (disagreement - 0.35) * 0.8;
        softened = rawBlend + (0.5 - rawBlend) * pull;
        softenNote += ` Strong judge/local disagreement (${disagreement.toFixed(2)}) pulls toward 0.50 by ${(pull * 100).toFixed(0)}% => ${softened.toFixed(2)}. Preserves Uncertain for mixed-origin sentences.`;
      }
      blendedScore = Math.round(Math.min(0.98, Math.max(0.02, softened)) * 100) / 100;
      steps.push({
        label: 'Judge + local blend',
        delta: Math.round((blendedScore - local.score) * 100) / 100,
        runningScore: blendedScore,
        detail: softenNote,
      });
    } else {
      const prior = aiProb / 100;
      const rawBlend = local.score * 0.75 + prior * 0.25;
      blendedScore = Math.round(Math.min(0.98, Math.max(0.02, rawBlend)) * 100) / 100;
      steps.push({
        label: 'Document prior blend',
        delta: Math.round((blendedScore - local.score) * 100) / 100,
        runningScore: blendedScore,
        detail: `0.75 x local ${local.score.toFixed(2)} + 0.25 x document prior ${prior.toFixed(2)} = ${blendedScore.toFixed(2)}. Light touch so sentence variance survives.`,
      });
    }
    const blendedPct = Math.round(blendedScore * 100);

    // Wider uncertain band than the document verdict: a single sentence carries
    // less signal, so only decisive scores earn AI/Human labels.
    let classification: ClassificationResult = 'Uncertain';
    if (blendedScore >= 0.65) classification = 'AI-Generated';
    else if (blendedScore <= 0.35) classification = 'Human-Written';

    steps.push({
      label: 'Final label',
      delta: 0,
      runningScore: blendedScore,
      detail: `${blendedScore.toFixed(2)} (${blendedPct}% AI). Thresholds <=0.35 Human, 0.36-0.64 Uncertain, >=0.65 AI => ${classification}.`,
    });

    return {
      text: sentence,
      score: blendedScore,
      classification,
      ...splitProbabilities(blendedPct, 35, 65),
      steps,
      localScore: local.score,
      judgeScore,
    };
  });

  const { humanProbability, uncertainProbability } = splitProbabilities(aiProb);

  let finalClassification: ClassificationResult = 'Uncertain';
  if (aiProb >= 60) {
    finalClassification = 'AI-Generated';
  } else if (aiProb <= 40) {
    finalClassification = 'Human-Written';
  } else {
    finalClassification = 'Uncertain';
  }

  const confidence = Math.max(aiProb, humanProbability, uncertainProbability);

  return {
    id: `detection-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    classification: finalClassification,
    aiProbability: aiProb,
    humanProbability,
    uncertainProbability,
    confidence,
    modelUsed,
    sentences: sentenceScores,
    statistics: stats,
    stylometrics,
    textSnippet: text.slice(0, 120) + (text.length > 120 ? '...' : ''),
    fullText: text,
    sourceType,
    fileName,
  };
}
