'use client';

import React from 'react';
import { RankChangeItem } from '@/types';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface RankChangeTrackerProps {
  rankChanges: RankChangeItem[];
}

export function RankChangeTracker({ rankChanges }: RankChangeTrackerProps) {
  if (rankChanges.length === 0) return null;

  const significantChanges = rankChanges.filter((r) => r.rankDelta !== 0 || r.previousScore !== r.newScore);

  return (
    <div className="bg-slate-900/90 border border-indigo-900/80 rounded-2xl p-4 glow-box-purple animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
          <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
            Live Rank Change & Re-Sorting Tracker
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Triggered by Architecture Playground tuning
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {rankChanges.slice(0, 6).map((item) => {
          let deltaBadge = 'bg-slate-950 text-slate-400 border-slate-800';
          let icon = <Minus className="w-3 h-3 text-slate-500" />;

          if (item.rankDelta > 0) {
            deltaBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
            icon = <TrendingUp className="w-3 h-3 text-emerald-400" />;
          } else if (item.rankDelta < 0) {
            deltaBadge = 'bg-rose-950 text-rose-300 border-rose-800';
            icon = <TrendingDown className="w-3 h-3 text-rose-400" />;
          }

          return (
            <div key={item.profileId} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-xs ${deltaBadge}`}>
              {icon}
              <span className="font-bold text-white">{item.profileName}</span>
              <span className="text-slate-400 text-[11px]">
                #{item.previousRank} &rarr; #{item.newRank}
              </span>
              <span className="text-cyan-400 text-[11px] font-bold">
                ({item.newScore}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
