'use client';

import React from 'react';
import { TeamWorkloadItem } from '@/types';
import { Users, AlertTriangle, CheckCircle2, Clock, Briefcase, Award } from 'lucide-react';

interface TeamWorkloadWidgetProps {
  workloads: TeamWorkloadItem[];
}

export function TeamWorkloadWidget({ workloads }: TeamWorkloadWidgetProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 glow-box space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Team Member Workload & Capacity Analysis
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-md">
                {workloads.length} Members
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time task distribution, active load, and overload risk indicators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300">
            Optimal Load
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-800 text-amber-300">
            High Load
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300">
            Overloaded
          </span>
        </div>
      </div>

      {/* Employee Workload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workloads.map((item) => {
          let badgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-800';
          if (item.workloadStatus === 'Overloaded') {
            badgeStyle = 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';
          } else if (item.workloadStatus === 'High') {
            badgeStyle = 'bg-amber-950 text-amber-300 border-amber-800';
          }

          // Workload bar percentage capped at 100
          const loadPct = Math.min(100, (item.activeTaskCount / 5) * 100);

          return (
            <div
              key={item.employeeName}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all"
            >
              {/* Member Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatarUrl}
                    alt={item.employeeName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">{item.employeeName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">{item.title}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badgeStyle}`}>
                  {item.workloadStatus}
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Active Workload</span>
                  <span className="text-white font-bold">{item.activeTaskCount} active / {item.assignedTaskCount} total</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.workloadStatus === 'Overloaded'
                        ? 'bg-rose-500'
                        : item.workloadStatus === 'High'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>
              </div>

              {/* Task Breakdown Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 font-mono text-[11px] text-center">
                <div className="p-1.5 rounded-lg bg-slate-900">
                  <span className="text-slate-500 block text-[9px] uppercase">Done</span>
                  <span className="text-emerald-400 font-bold">{item.completedTaskCount}</span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900">
                  <span className="text-slate-500 block text-[9px] uppercase">High Pri</span>
                  <span className="text-amber-400 font-bold">{item.highPriorityCount}</span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900">
                  <span className="text-slate-500 block text-[9px] uppercase">Overdue</span>
                  <span className={item.overdueTaskCount > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {item.overdueTaskCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
