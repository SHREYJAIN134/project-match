'use client';

import React from 'react';
import { MatchScoreResult } from '@/types';
import { ShieldAlert, Award, Clock, CheckCircle2, XCircle, Sparkles, BarChart2, Eye, GitCompare } from 'lucide-react';

interface CandidateComparisonTableProps {
  matchResults: MatchScoreResult[];
  onSelectCandidateForDetail: (match: MatchScoreResult) => void;
  selectedForCompare: string[];
  onToggleCompare: (profileId: string) => void;
  onOpenCompareModal: () => void;
}

export function CandidateComparisonTable({
  matchResults,
  onSelectCandidateForDetail,
  selectedForCompare,
  onToggleCompare,
  onOpenCompareModal,
}: CandidateComparisonTableProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden glow-box">
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Candidate Suitability Analytical Table
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-md">
                {matchResults.length} Evaluated
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Multi-dimensional evaluation matrix for all candidates passing initial capacity filters
            </p>
          </div>
        </div>

        {/* Compare Selected Button */}
        {selectedForCompare.length > 0 && (
          <button
            onClick={onOpenCompareModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all animate-bounce"
          >
            <GitCompare className="w-4 h-4" />
            Compare Selected ({selectedForCompare.length}) Side-by-Side
          </button>
        )}
      </div>

      {/* Analytical Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4 text-center">Compare</th>
              <th className="py-3.5 px-4">Rank & Candidate</th>
              <th className="py-3.5 px-4 text-center">Suitability Level</th>
              <th className="py-3.5 px-4 text-center">Match Score</th>
              <th className="py-3.5 px-4 text-center">Skill Coverage</th>
              <th className="py-3.5 px-4">Direct Matches</th>
              <th className="py-3.5 px-4">Missing Skills</th>
              <th className="py-3.5 px-4">Complementary</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {matchResults.map((result, idx) => {
              const profile = result.profile;
              const suitability = result.suitabilityProfile;
              const isSelected = selectedForCompare.includes(profile.id);

              // Suitability Badge Styling
              let levelBadge = 'bg-slate-800 text-slate-300 border-slate-700';
              if (suitability?.suitabilityLevel === 'Excellent Fit') {
                levelBadge = 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80';
              } else if (suitability?.suitabilityLevel === 'Strong Fit') {
                levelBadge = 'bg-cyan-950/90 text-cyan-300 border-cyan-700/80';
              } else if (suitability?.suitabilityLevel === 'Moderate Fit') {
                levelBadge = 'bg-indigo-950/90 text-indigo-300 border-indigo-700/80';
              } else if (suitability?.suitabilityLevel === 'Weak Fit') {
                levelBadge = 'bg-amber-950/90 text-amber-300 border-amber-700/80';
              } else if (suitability?.suitabilityLevel === 'Not Suitable') {
                levelBadge = 'bg-rose-950/90 text-rose-300 border-rose-700/80';
              }

              return (
                <tr
                  key={profile.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleCompare(profile.id)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                    />
                  </td>

                  {/* Rank & Candidate */}
                  <td className="py-3.5 px-4 font-sans">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400 w-5">
                        #{idx + 1}
                      </span>
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer" onClick={() => onSelectCandidateForDetail(result)}>
                          {profile.full_name}
                        </p>
                        <p className="text-[11px] text-slate-400">{profile.title}</p>
                      </div>
                    </div>
                  </td>

                  {/* Suitability Level */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${levelBadge}`}>
                      {suitability?.suitabilityLevel || 'Moderate Fit'}
                    </span>
                  </td>

                  {/* Match Score */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-sm font-extrabold text-cyan-400">
                        {result.totalScore}%
                      </span>
                      {result.hardGated && (
                        <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                          <ShieldAlert className="w-2.5 h-2.5" /> Cap 40%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Skill Coverage % */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <div className="w-24 mx-auto">
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1">
                        <span>{suitability?.skillCoveragePct || 0}%</span>
                        <span className="text-slate-500">
                          {suitability?.directMatchCount}/{result.project.required_skills.length}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full"
                          style={{ width: `${suitability?.skillCoveragePct || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Direct Matches */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {suitability?.directMatchedSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 text-[10px]">
                          {skill}
                        </span>
                      ))}
                      {(suitability?.directMatchedSkills.length || 0) > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{(suitability?.directMatchedSkills.length || 0) - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Missing Skills */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {suitability?.missingSkills.slice(0, 2).map((skill) => (
                        <span key={skill} className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 text-[10px]">
                          {skill}
                        </span>
                      ))}
                      {(suitability?.missingSkills.length || 0) > 2 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{(suitability?.missingSkills.length || 0) - 2}
                        </span>
                      )}
                      {(suitability?.missingSkills.length || 0) === 0 && (
                        <span className="text-[10px] text-emerald-400 font-mono">None Missing</span>
                      )}
                    </div>
                  </td>

                  {/* Complementary Skills */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {suitability?.complementarySkills.slice(0, 2).map((skill) => (
                        <span key={skill} className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/80 text-[10px]">
                          +{skill}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectCandidateForDetail(result)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white font-mono text-[11px] inline-flex items-center gap-1 border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
