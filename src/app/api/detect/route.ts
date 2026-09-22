import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/detection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sourceType, fileName, engine } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text content is required for analysis.' },
        { status: 400 }
      );
    }

    // Gemini judge by default; explicit 'local' opts out. Local engine is the
    // automatic fallback whenever the Gemini call fails.
    const result = await analyzeText(
      text,
      sourceType || 'text',
      fileName,
      engine === 'local' ? 'local' : 'gemini'
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Detection API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during AI detection.' },
      { status: 500 }
    );
  }
}
