'use client';

import React from 'react';
import { MatchScoreResult } from '@/types';
import { X, Award, Clock, CheckCircle2, ShieldAlert, Sparkles, AlertTriangle, ExternalLink, Bot, Check, HelpCircle } from 'lucide-react';

interface CandidateAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: MatchScoreResult | null;
}

export function CandidateAnalyticsModal({
  isOpen,
  onClose,
  matchResult,
}: CandidateAnalyticsModalProps) {
  if (!isOpen || !matchResult) return null;

  const { profile, project, totalScore, jaccardSimilarity, availabilityRatio, criticalBonusApplied, hardGated, availabilityQualified, llmExplanation, suitabilityProfile: suitability } = matchResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative glow-box my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Candidate Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {profile.full_name}
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-md">
                  {suitability?.suitabilityLevel}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">{profile.title}</p>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mt-1">
                <span>{profile.experience_years} years exp</span>
                <span>•</span>
                <span>{profile.availability_hours}h / week availability</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="px-4 py-2 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono font-extrabold text-2xl shadow-lg">
              {totalScore}%
            </div>
            <p className="text-[11px] font-mono text-slate-500 mt-1">Overall Suitability Score</p>
          </div>
        </div>

        {/* Suitability Dimension Score Bars */}
        <div className="mb-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Suitability Dimension Breakdown
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {/* Skill Fit */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Skill Fit (Jaccard Similarity)</span>
                <span className="text-cyan-400 font-bold">{Math.round(jaccardSimilarity * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.round(jaccardSimilarity * 100)}%` }} />
              </div>
            </div>

            {/* Availability Ratio */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Availability Ratio</span>
                <span className="text-indigo-400 font-bold">{Math.round(availabilityRatio * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round(availabilityRatio * 100)}%` }} />
              </div>
            </div>

            {/* Skill Coverage % */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Skill Coverage (Matched / Required)</span>
                <span className="text-emerald-400 font-bold">{suitability?.skillCoveragePct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${suitability?.skillCoveragePct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Skill-by-Skill Analysis Matrix */}
        <div className="mb-6">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
            Skill-by-Skill Requirement Analysis
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suitability?.skillAnalysis.map((item, idx) => {
              let badgeStyle = 'bg-slate-950 text-slate-400 border-slate-800';
              if (item.matchLevel === 'strong') {
                badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-800';
              } else if (item.matchLevel === 'missing') {
                badgeStyle = 'bg-rose-950 text-rose-300 border-rose-800';
              } else if (item.matchLevel === 'complementary') {
                badgeStyle = 'bg-purple-950 text-purple-300 border-purple-800';
              }

              return (
                <div key={idx} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${badgeStyle}`}>
                  <span className="font-bold flex items-center gap-1.5">
                    {item.matchLevel === 'strong' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    {item.matchLevel === 'missing' && <X className="w-3.5 h-3.5 text-rose-400" />}
                    {item.matchLevel === 'complementary' && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                    {item.skill}
                  </span>
                  <span className="text-[10px] uppercase opacity-80">{item.matchLevel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fact-Based Strengths & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 text-xs">
            <h4 className="font-bold text-emerald-400 font-mono mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Evaluated Strengths
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              {suitability?.strengths.map((str, i) => (
                <li key={i}>• {str}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-xs">
            <h4 className="font-bold text-rose-400 font-mono mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Identified Risks & Gaps
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              {suitability?.gaps.map((gap, i) => (
                <li key={i}>• {gap}</li>
              ))}
              {suitability?.gaps.length === 0 && <li>• Zero technical risks identified</li>}
            </ul>
          </div>
        </div>

        {/* AI Complementarity Rationale */}
        {llmExplanation && (
          <div className="bg-slate-950 border border-indigo-900/60 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 font-mono">
                AI Complementarity Rationale (Groq / Gemini Flash)
              </span>
            </div>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              &quot;{llmExplanation}&quot;
            </p>
          </div>
        )}

        {/* Deterministic Recommendation Statement */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <strong className="text-cyan-400 font-mono block mb-1">Deterministic Recommendation:</strong>
          <p className="text-slate-200 leading-relaxed font-sans">{suitability?.recommendation}</p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
}
