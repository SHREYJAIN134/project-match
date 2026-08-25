import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'ProjectMatch — Event-Driven Hybrid-Intelligence Matching',
  description: 'Deterministic math scoring engine with LLM complementarity rationales & real-time architecture playground.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>ProjectMatch Platform • Next.js 15 & Supabase</span>
            </div>
            <p>Hybrid-Intelligence Team Matching • Deterministic Math Engine + Groq/Gemini LLM</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
