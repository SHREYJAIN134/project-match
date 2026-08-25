'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, Sparkles, Sliders, ShieldCheck, Zap, Database, Layers, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-purple-600/10 blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 mb-8 glow-box">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Hybrid-Intelligence Matching Algorithm v1.5</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Event-Driven Autonomous{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
            Team Matching Platform
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Combines deterministic mathematical scoring (Jaccard similarity + commitment availability) with Groq/Gemini LLM complementarity rationales and real-time weight tuning.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105"
          >
            <Sliders className="w-5 h-5" />
            Launch Dashboard & Playground
            <ArrowRight className="w-5 h-5" />
          </Link>

          <a
            href="#architecture"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base flex items-center justify-center gap-2 transition-all"
          >
            <Layers className="w-5 h-5 text-indigo-400" />
            View Architecture Specs
          </a>
        </div>

        {/* Live Metrics Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs font-mono text-slate-400 uppercase">Math Scoring</p>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">100%</p>
            <p className="text-[11px] text-slate-500">Deterministic Jaccard overlap</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs font-mono text-slate-400 uppercase">Hard Gate</p>
            <p className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">&lt;30% &rarr; 40%</p>
            <p className="text-[11px] text-slate-500">Score cap rule enforced</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs font-mono text-slate-400 uppercase">LLM Rationale</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">2 Sentences</p>
            <p className="text-[11px] text-slate-500">Groq / Gemini Flash LLM</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs font-mono text-slate-400 uppercase">Playground</p>
            <p className="text-2xl font-extrabold text-purple-400 font-mono mt-1">&lt;10ms</p>
            <p className="text-[11px] text-slate-500">Instant client re-sorting</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white tracking-tight">Core Platform Features</h2>
          <p className="text-slate-400 text-sm mt-2">Built for production-grade engineering team assembly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glow-box">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deterministic Filtering</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Profiles with weekly availability hours lower than project commitment requirements are automatically filtered out before candidate scoring begins.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glow-box">
            <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Jaccard Similarity + Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates set intersection over set union for skills, applies a 15% critical skill bonus, and strictly caps low-overlap scores (&lt;30%) at 40%.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 glow-box">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">LLM Complementarity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Top candidate cards receive a concise 2-sentence rationale generated by Groq / Gemini Flash. Numerical rank remains 100% mathematical and uncorrupted.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Pipeline Specs */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 lg:p-12 glow-box-purple">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Matching Algorithm Pipeline</h2>
              <p className="text-xs text-slate-400">Mathematical Specification & Control Architecture</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 font-mono text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">Step 1: Deterministic Capacity Filter</span>
                <code>if (profile.availability_hours &lt; project.required_hours) -&gt; FILTER_OUT</code>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">Step 2: Jaccard Skill Overlap Formula</span>
                <code>Jaccard = |ProfileSkills &cap; ProjectSkills| / |ProfileSkills &cup; ProjectSkills|</code>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">Step 3: Weighted Synthesis & Critical Bonus</span>
                <code>Score = (Jaccard &times; W_skill + AvailRatio &times; W_avail) &times; 100 + Bonus</code>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">Step 4: Hard Gate Enforcement Rule</span>
                <code>if (Jaccard &lt; 0.30) -&gt; Score = MIN(40.0, Score)</code>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Guarantees & Production Criteria
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero LLM Hallucination on Scores:</strong> Numerical ranking is 100% code-driven math.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Instant Interactive Slider Tuning:</strong> Resorts 10+ profiles in real time with client-side React state.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Hybrid Supabase Storage:</strong> Fallback memory cache guarantees seamless local execution without credentials.</span>
                </li>
              </ul>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Test Interactive Playground
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
