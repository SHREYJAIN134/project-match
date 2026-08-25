'use client';

import React from 'react';
import { MatchScoreResult } from '@/types';
import { Sparkles, ShieldAlert, Clock, Award, CheckCircle2, AlertTriangle, ExternalLink, Bot } from 'lucide-react';

interface CandidateCardProps {
  matchResult: MatchScoreResult;
  rank: number;
}

export function CandidateCard({ matchResult, rank }: CandidateCardProps) {
  const {
    profile,
    project,
    totalScore,
    jaccardSimilarity,
    availabilityRatio,
    criticalBonusApplied,
    hardGated,
    availabilityQualified,
    criticalSkillsMatched,
    llmExplanation,
  } = matchResult;

  // Determine badge styling based on total match score
  let scoreBadgeStyle = 'bg-cyan-950/80 text-cyan-400 border-cyan-800/80';
  let scoreGlow = 'shadow-cyan-500/10';
  if (totalScore >= 75) {
    scoreBadgeStyle = 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80';
    scoreGlow = 'shadow-emerald-500/20';
  } else if (totalScore < 45) {
    scoreBadgeStyle = 'bg-rose-950/90 text-rose-300 border-rose-800/80';
    scoreGlow = 'shadow-rose-500/10';
  }

  // Find skill intersection for highlighting
  const projectSkillsNormalized = project.required_skills.map((s) => s.toLowerCase());

  return (
    <div className={`group relative bg-slate-900/80 border rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl ${
      hardGated ? 'border-amber-900/40 bg-amber-950/10' : 'border-slate-800'
    }`}>
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-cyan-500 transition-colors shadow-md"
            />
            <span className="absolute -top-2 -left-2 w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono font-bold text-slate-300 flex items-center justify-center">
              #{rank}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {profile.full_name}
              </h3>
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-slate-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">{profile.title}</p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Award className="w-3 h-3 text-indigo-400" />
                {profile.experience_years} yrs exp
              </span>
              <span>•</span>
              <span className={`flex items-center gap-1 ${
                availabilityQualified ? 'text-emerald-400' : 'text-rose-400 font-semibold'
              }`}>
                <Clock className="w-3 h-3" />
                {profile.availability_hours}h / wk available
                {!availabilityQualified && ' (Req: ' + project.required_hours + 'h)'}
              </span>
            </div>
          </div>
        </div>

        {/* Score Badge */}
        <div className="flex flex-col items-end">
          <div className={`px-3.5 py-1.5 rounded-xl border font-mono font-extrabold text-lg flex items-center gap-1.5 shadow-lg ${scoreBadgeStyle} ${scoreGlow}`}>
            <span>{totalScore}%</span>
            <span className="text-[10px] font-sans font-normal opacity-80 uppercase tracking-wider">Match</span>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Skill: {Math.round(jaccardSimilarity * 100)}% | Avail: {Math.round(availabilityRatio * 100)}%
          </p>
        </div>
      </div>

      {/* Warnings & Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {hardGated && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/80 text-xs font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Hard Gate: Score Capped at 40% (Skill Overlap &lt; 30%)
          </span>
        )}

        {criticalBonusApplied && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            +15% Critical Skill Bonus ({criticalSkillsMatched.join(', ')})
          </span>
        )}

        {!availabilityQualified && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/80 text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Under-Available ({profile.availability_hours}h vs {project.required_hours}h required)
          </span>
        )}
      </div>

      {/* Skills Array */}
      <div className="mb-4">
        <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">Skills & Compatibility</p>
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => {
            const isMatch = projectSkillsNormalized.includes(skill.toLowerCase());
            const isCritical = project.critical_skills.map(c => c.toLowerCase()).includes(skill.toLowerCase());
            return (
              <span
                key={skill}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-colors ${
                  isCritical && isMatch
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-semibold'
                    : isMatch
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800/80'
                    : 'bg-slate-950 text-slate-400 border-slate-800/80'
                }`}
              >
                {isMatch && <CheckCircle2 className="w-3 h-3 inline mr-1 text-cyan-400" />}
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* LLM Explanation Rationale Callout */}
      {llmExplanation && (
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/90 border border-indigo-900/50 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-indigo-300 font-mono tracking-wide">
                LLM Complementarity Rationale
              </span>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">Groq / Gemini Flash</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
              &quot;{llmExplanation}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
