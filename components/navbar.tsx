'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, Sparkles, Layers, Sliders, Users } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                ProjectMatch
              </span>
              <span className="text-[10px] uppercase tracking-widest font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded-full">
                v1.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono -mt-0.5">Hybrid-Intelligence Matching</p>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            Playground & Matching
          </Link>

          <Link
            href="/#architecture"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            Architecture
          </Link>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Ready
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
