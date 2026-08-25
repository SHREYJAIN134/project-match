'use client';

import React from 'react';
import { MatchScoreResult } from '@/types';
import { X, GitCompare, CheckCircle2, ShieldAlert, Award, Clock, Sparkles } from 'lucide-react';

interface CandidateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMatches: MatchScoreResult[];
}

export function CandidateComparisonModal({
  isOpen,
  onClose,
  selectedMatches,
}: CandidateComparisonModalProps) {
  if (!isOpen || selectedMatches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative glow-box-purple my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-800 text-indigo-400">
            <GitCompare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Side-by-Side Candidate Suitability Comparison
            </h2>
            <p className="text-xs text-slate-400">
              Comparing {selectedMatches.length} candidates against project requirements & suitability dimensions
            </p>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedMatches.map((match, idx) => {
            const profile = match.profile;
            const project = match.project;
            const suitability = match.suitabilityProfile;

            return (
              <div
                key={profile.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative space-y-5 flex flex-col justify-between"
              >
                <div>
                  {/* Candidate Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        Candidate #{idx + 1}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">{profile.full_name}</h3>
                      <p className="text-xs text-slate-400">{profile.title}</p>
                    </div>
                  </div>

                  {/* Suitability Level & Score Badge */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <p className="text-2xl font-extrabold text-cyan-400 font-mono">
                      {match.totalScore}%
                    </p>
                    <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
                      {suitability?.suitabilityLevel}
                    </p>
                  </div>

                  {/* Metrics Table */}
                  <div className="mt-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Skill Coverage</span>
                      <span className="text-white font-bold">{suitability?.skillCoveragePct}%</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Direct Skill Matches</span>
                      <span className="text-cyan-400 font-bold">{suitability?.directMatchCount} / {project.required_skills.length}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Missing Skills</span>
                      <span className="text-rose-400 font-bold">{suitability?.missingSkillCount}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Complementary Skills</span>
                      <span className="text-purple-400 font-bold">+{suitability?.complementarySkillCount}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Availability</span>
                      <span className="text-slate-200">{profile.availability_hours}h / {project.required_hours}h req</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Experience</span>
                      <span className="text-slate-200">{profile.experience_years} yrs</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400">Critical Bonus</span>
                      <span className={match.criticalBonusApplied ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                        {match.criticalBonusApplied ? 'Unlocked (+15%)' : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Skills Lists */}
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-mono text-slate-400 uppercase">Direct Matches</p>
                    <div className="flex flex-wrap gap-1">
                      {suitability?.directMatchedSkills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {suitability?.missingSkills.length! > 0 && (
                      <>
                        <p className="text-[11px] font-mono text-slate-400 uppercase pt-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {suitability?.missingSkills.map((skill) => (
                            <span key={skill} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-sans text-slate-300">
                  <strong className="text-cyan-400 font-mono block mb-1">Recommendation:</strong>
                  {suitability?.recommendation}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
