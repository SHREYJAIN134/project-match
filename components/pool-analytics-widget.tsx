'use client';

import React from 'react';
import { ProjectPoolAnalytics, Project } from '@/types';
import { Users, PieChart, AlertCircle, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';

interface PoolAnalyticsWidgetProps {
  analytics: ProjectPoolAnalytics;
  project: Project;
}

export function PoolAnalyticsWidget({ analytics, project }: PoolAnalyticsWidgetProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 glow-box space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Product & Candidate Pool Level Analytics
              <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-md">
                {project.title}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Macro insights on skill gap frequency, candidate distribution & pool health
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
            {analytics.eligibleCount} Eligible
          </span>
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-rose-400">
            {analytics.hardFilteredCount} Hard Filtered
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase">Evaluated Pool Size</p>
          <p className="text-2xl font-extrabold text-white font-mono mt-1">{analytics.totalEvaluated}</p>
          <p className="text-[10px] text-slate-500">Total profiles analyzed</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase">Average Match Score</p>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{analytics.averageScore}%</p>
          <p className="text-[10px] text-slate-500">Across entire candidate pool</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase">Median Score</p>
          <p className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">{analytics.medianScore}%</p>
          <p className="text-[10px] text-slate-500">Middle ranking candidate</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase">Top Fit Candidates</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {analytics.fitDistribution.excellent + analytics.fitDistribution.strong}
          </p>
          <p className="text-[10px] text-slate-500">Excellent + Strong fit profiles</p>
        </div>
      </div>

      {/* Candidate Fit Level Distribution */}
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
          Candidate Pool Fit Distribution
        </h4>
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400">Excellent ({analytics.fitDistribution.excellent})</span>
            <span className="text-cyan-400">Strong ({analytics.fitDistribution.strong})</span>
            <span className="text-indigo-400">Moderate ({analytics.fitDistribution.moderate})</span>
            <span className="text-amber-400">Weak ({analytics.fitDistribution.weak})</span>
            <span className="text-rose-400">Not Suitable ({analytics.fitDistribution.notSuitable})</span>
          </div>

          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: `${(analytics.fitDistribution.excellent / analytics.totalEvaluated) * 100}%` }} title="Excellent Fit" />
            <div className="h-full bg-cyan-500" style={{ width: `${(analytics.fitDistribution.strong / analytics.totalEvaluated) * 100}%` }} title="Strong Fit" />
            <div className="h-full bg-indigo-500" style={{ width: `${(analytics.fitDistribution.moderate / analytics.totalEvaluated) * 100}%` }} title="Moderate Fit" />
            <div className="h-full bg-amber-500" style={{ width: `${(analytics.fitDistribution.weak / analytics.totalEvaluated) * 100}%` }} title="Weak Fit" />
            <div className="h-full bg-rose-500" style={{ width: `${(analytics.fitDistribution.notSuitable / analytics.totalEvaluated) * 100}%` }} title="Not Suitable" />
          </div>
        </div>
      </div>

      {/* Pool Skill Gap Frequency & Complementary Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pool Skill Gap Frequencies */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Pool Skill Gap Frequency Analysis
          </h4>
          <p className="text-[11px] text-slate-500">Required project skills missing across candidate pool</p>

          <div className="space-y-2.5 font-mono text-xs">
            {analytics.skillGapFrequencies.map((item) => (
              <div key={item.skill}>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>{item.skill}</span>
                  <span className={item.missingPct > 50 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    Missing in {item.missingPct}% ({item.missingCount}/{analytics.totalEvaluated})
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.missingPct > 50 ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${item.missingPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Complementary Skills */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Top Complementary Skills Offered
          </h4>
          <p className="text-[11px] text-slate-500">Valuable extra capabilities candidates bring beyond project baseline</p>

          <div className="space-y-2 font-mono text-xs">
            {analytics.topComplementarySkills.map((comp) => (
              <div key={comp.skill} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-purple-300 font-bold">+{comp.skill}</span>
                <span className="text-slate-400 text-[11px]">{comp.count} candidates</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
