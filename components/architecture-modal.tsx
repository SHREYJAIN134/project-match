'use client';

import React from 'react';
import { X, Layers, CheckCircle2, ShieldCheck, Cpu, Sparkles, Bot, Lock } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative glow-box-purple my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              ProjectMatch Platform Architecture & Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic Mathematical Engine + AI Explanation & Decision Support Microservices
            </p>
          </div>
        </div>

        {/* Pipeline Diagram Step-by-Step */}
        <div className="space-y-4 font-mono text-xs mb-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-800">
              1
            </div>
            <div>
              <h4 className="font-bold text-cyan-300">Project Creation & Schema Validation</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Project requirements, required skills, critical skills (+15% bonus), required hours, and minimum experience years are validated using Zod schemas.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 font-bold flex items-center justify-center shrink-0 border border-indigo-800">
              2
            </div>
            <div>
              <h4 className="font-bold text-indigo-300">Deterministic Hard SQL Capacity Filtering</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Profiles with availability hours lower than project required commitment hours (<code className="text-indigo-400">availability_hours &lt; project.required_hours</code>) are hard-filtered out before scoring begins.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-800">
              3
            </div>
            <div>
              <h4 className="font-bold text-emerald-300">Jaccard Similarity & Availability Ratio Formula</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Calculates skill set overlap <code className="text-emerald-400">Jaccard = |ProfileSkills &cap; ProjectSkills| / |ProfileSkills &cup; ProjectSkills|</code> and adds a 15% critical skill bonus.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-950 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-800">
              4
            </div>
            <div>
              <h4 className="font-bold text-amber-300">Hard Gate Enforcement Rule</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                If skill overlap is strictly under 30% (<code className="text-amber-400">Jaccard &lt; 0.30</code>), the total match score is strictly capped at a maximum of 40.0%.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-950 text-purple-400 font-bold flex items-center justify-center shrink-0 border border-purple-800">
              5
            </div>
            <div>
              <h4 className="font-bold text-purple-300">Deterministic Candidate Ranking</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Candidates are ranked strictly by mathematical <code className="text-purple-400">totalScore</code> descending. Ranking is 100% reproducible and code-driven.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-800">
              6
            </div>
            <div>
              <h4 className="font-bold text-cyan-300">AI Explanation & AI Candidate Decision Advisor</h4>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Top candidates receive 2-sentence Groq/Gemini Flash complementarity rationales and decision support advice. The AI explains findings and trade-offs without modifying mathematical ranks.
              </p>
            </div>
          </div>
        </div>

        {/* Guarantees Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <h4 className="font-bold text-white font-mono mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> System Architectural Guarantees
          </h4>
          <ul className="space-y-1 text-slate-300 font-sans">
            <li>• <strong>Zero LLM Hallucination on Rankings:</strong> Scores and ranks are calculated strictly by code math.</li>
            <li>• <strong>Prompt Security:</strong> Candidate inputs are sanitized; unevidenced character traits are explicitly rejected.</li>
            <li>• <strong>Real-time Tuning:</strong> Architecture Playground sliders resort candidates live on the client.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
          >
            Close Architecture Specs
          </button>
        </div>
      </div>
    </div>
  );
}
