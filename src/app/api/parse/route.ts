import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded.' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileSize = file.size;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      try {
        // Dynamic import pdf-parse for node server environment
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
      } catch (pdfErr: any) {
        console.error('PDF parsing error:', pdfErr);
        return NextResponse.json(
          { error: 'Could not extract text from the PDF file. Ensure the PDF is not encrypted or image-only.' },
          { status: 422 }
        );
      }
    } else if (fileExtension === 'docx' || fileExtension === 'doc') {
      try {
        const mammoth = require('mammoth');
        const docResult = await mammoth.extractRawText({ buffer });
        extractedText = docResult.value;
      } catch (docErr: any) {
        console.error('DOCX parsing error:', docErr);
        return NextResponse.json(
          { error: 'Could not extract text from Word document.' },
          { status: 422 }
        );
      }
    } else if (['txt', 'md', 'json', 'csv', 'html'].includes(fileExtension || '')) {
      extractedText = buffer.toString('utf-8');
    } else {
      // Fallback text conversion attempt
      extractedText = buffer.toString('utf-8');
    }

    // Clean up excessive whitespace
    extractedText = extractedText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'Extracted text was empty or invalid.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      fileName,
      fileSize,
      fileExtension,
      characterCount: extractedText.length,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (error: any) {
    console.error('File Upload Parsing Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse file content.' },
      { status: 500 }
    );
  }
}
