# AI Content Detector

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://ai-content-detector-seven.vercel.app/)

Next.js app that classifies text as **AI-Generated**, **Human-Written**, or **Uncertain / Mixed**, with sentence-level heatmaps, confidence breakdowns, and stylometric insights. Supports pasted text plus PDF / Word uploads.

Live repo: https://github.com/Livino13/ai-content-detector

## Live Demo

Try it here: **https://ai-content-detector-seven.vercel.app/** (deployed on Vercel, Gemini judge enabled).

## Features

- Paste-text analysis + PDF (`.pdf`) and Word (`.docx`) upload and parsing
- Document verdict with AI / Human / Uncertain probabilities and confidence meter
- Sentence-by-sentence heatmap (hover any sentence for its individual score)
- Stylometric panel: burstiness, perplexity estimate, vocabulary diversity, repetitiveness
- Text statistics: words, characters, sentences, paragraphs, reading time
- Local history sidebar (localStorage, up to 30 items)
- Built-in samples: pure AI essay, pure human blog, mixed hybrid paragraph

## Tech stack

- Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- `pdf-parse` + `mammoth` for file extraction, `framer-motion` + `lucide-react` for UI
- Detection: offline stylometric engine + server-side Gemini LLM judge (automatic fallback to local)

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build check
```

### Environment

Create `.env.local` (never committed — see `.gitignore`):

```
AI_JUDGE_API_KEY=your_gemini_api_key
```

Without a key the app still works fully on the local engine; with a key it uses the Gemini judge first and falls back to local on any failure.

## How detection works

`src/lib/detection.ts` — all scoring lives server-side; the frontend only renders the returned percentages.

1. **Document prior** — burstiness (sentence-length variance), AI transition-marker density (`furthermore`, `moreover`, …), and average sentence length combine into an overall AI %.
2. **Sentence scores** — each sentence starts at a neutral `0.50` prior, then signed evidence is applied: AI markers (`+0.30`, mitigated to `+0.16` beside first-person voice), personal/anecdotal voice (`-0.22`), length bands (fragments human, polished 15–30w AI), informality (`-0.08`), formal lexical density (`+0.12`), document-burstiness context, and high-TTR polish. Marker + personal-voice conflicts are pulled toward `0.50` so hybrid sentences land **Uncertain**; ultra-short marker sentences are floored into the uncertain band.
3. **Blending** — local-only mode: `0.75 × local + 0.25 × document prior`. Gemini mode: `0.55 × judge + 0.45 × local`, plus softening toward `0.50` on strong judge/local disagreement (fixes LLM polarization where judges return only `0.05 / 0.95`).
4. **Three-way split** — AI % is direct; Uncertain follows a triangular curve peaking at ~25% near 50% AI and decaying to ~3% at the extremes; Human gets the remainder.
5. **Labels** — sentences: `≥65%` AI, `≤35%` Human, else Uncertain. Documents: `≥60%` AI, `≤40%` Human, else Uncertain.

## API

- `POST /api/detect` — `{ text, engine: 'gemini' | 'local', sourceType?, fileName? }` → `DetectionResult` (verdict, probabilities, per-sentence scores with derivation steps, statistics, stylometrics)
- `POST /api/parse` — file upload (`multipart/form-data`) → extracted `{ text, fileName, stats }`

## Project structure

```
src/
  app/
    api/detect/route.ts   # detection endpoint (Gemini judge server-side)
    api/parse/route.ts    # PDF/DOCX text extraction endpoint
    page.tsx              # main UI flow
  components/             # editor, heatmap, results, stats, history, upload
  lib/
    detection.ts          # scoring engine (stylometrics + blending)
    sampleTexts.ts        # AI / Human / Mixed demo samples
    types.ts              # DetectionResult, SentenceScore, metrics
```

## Notes

- The mixed sample is tuned so the heatmap shows all three bands (human anecdote → uncertain hybrid → formal AI summary).
- No detector is 100% — very short texts, formal human academic prose, or heavily humanized AI can still misclassify. Per-sentence scores carry less signal than the document verdict by design.
