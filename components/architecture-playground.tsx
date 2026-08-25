'use client';

import React from 'react';
import { PlaygroundWeights } from '@/types';
import { Sliders, ShieldAlert, Sparkles, RefreshCw, Cpu, Gauge, Lock } from 'lucide-react';

interface ArchitecturePlaygroundProps {
  weights: PlaygroundWeights;
  includeUnderAvailable: boolean;
  onWeightsChange: (newWeights: PlaygroundWeights, includeUnderAvailable: boolean) => void;
  onResetWeights: () => void;
  candidateCount: number;
  filteredCount: number;
}

export function ArchitecturePlayground({
  weights,
  includeUnderAvailable,
  onWeightsChange,
  onResetWeights,
  candidateCount,
  filteredCount,
}: ArchitecturePlaygroundProps) {
  const handleSkillWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skillWeight = Number(e.target.value);
    const availabilityWeight = 100 - skillWeight;
    onWeightsChange({ ...weights, skillWeight, availabilityWeight }, includeUnderAvailable);
  };

  const handleAvailWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const availabilityWeight = Number(e.target.value);
    const skillWeight = 100 - availabilityWeight;
    onWeightsChange({ ...weights, skillWeight, availabilityWeight }, includeUnderAvailable);
  };

  const handleMinScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeightsChange({ ...weights, minScoreGate: Number(e.target.value) }, includeUnderAvailable);
  };

  const handleBonusWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeightsChange({ ...weights, criticalBonusWeight: Number(e.target.value) }, includeUnderAvailable);
  };

  const handleToggleUnderAvailable = (e: React.ChangeEvent<HTMLInputElement>) => {
    onWeightsChange(weights, e.target.checked);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 glow-box backdrop-blur-sm">
      <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Architecture Playground
              <span className="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                Live Parameter Tuning
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Adjust math weights to re-order candidate scores instantly on the client.
            </p>
          </div>
        </div>

        <button
          onClick={onResetWeights}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
          title="Reset to default algorithm weights"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Skill Overlap Weight */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Skill Overlap Weight
            </span>
            <span className="font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
              {weights.skillWeight}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.skillWeight}
            onChange={handleSkillWeightChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[11px] text-slate-500 font-mono">Jaccard similarity math weight</p>
        </div>

        {/* 2. Availability Weight */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              Availability Weight
            </span>
            <span className="font-mono text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
              {weights.availabilityWeight}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.availabilityWeight}
            onChange={handleAvailWeightChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[11px] text-slate-500 font-mono">Hours commitment ratio weight</p>
        </div>

        {/* 3. Critical Skill Bonus */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Critical Skill Bonus
            </span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
              +{weights.criticalBonusWeight}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={weights.criticalBonusWeight}
            onChange={handleBonusWeightChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <p className="text-[11px] text-slate-500 font-mono">Bonus when matching all critical skills</p>
        </div>

        {/* 4. Minimum Score Gate Filter */}
        <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Minimum Score Gate
            </span>
            <span className="font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
              {weights.minScoreGate}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={weights.minScoreGate}
            onChange={handleMinScoreChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[11px] text-slate-500 font-mono">Hide candidates scoring below threshold</p>
        </div>
      </div>

      {/* Rules & Filter Toggles */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={includeUnderAvailable}
              onChange={handleToggleUnderAvailable}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
            />
            <span>Show under-available candidates (bypasses hard availability filter)</span>
          </label>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Hard Gate Rule: <strong className="text-white">Overlap &lt; 30% capped at 40%</strong>
          </span>
          <span className="text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Showing <strong className="text-cyan-400">{filteredCount}</strong> / {candidateCount} profiles
          </span>
        </div>
      </div>
    </div>
  );
}
