import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuroraBackground } from '@/components/AuroraBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'VeriTextAI | Advanced AI Content Detector & Stylometrics System',
  description: 'Detect AI generated content in text and uploaded files (PDF, DOCX, TXT) with confidence metrics, sentence heatmaps, and NLP stylometric statistics. Fully offline — no data leaves your machine.',
  keywords: ['AI Content Detector', 'Text Classifier', 'Stylometrics', 'PDF Text Analysis'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased bg-[#e9f1f8] text-[#2F4860] selection:bg-[#FFF7CC] selection:text-[#2F4860]">
        <AuroraBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
