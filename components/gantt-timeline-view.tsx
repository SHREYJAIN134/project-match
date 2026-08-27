'use client';

import React from 'react';
import { ProjectTask, Project } from '@/types';
import { evaluateTaskDeadlineStatus } from '@/lib/project-intelligence';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Link2, ArrowRight } from 'lucide-react';

interface GanttTimelineViewProps {
  tasks: ProjectTask[];
  project: Project;
}

export function GanttTimelineView({ tasks, project }: GanttTimelineViewProps) {
  // Derive timeline boundaries
  const projectStart = new Date('2026-08-20').getTime();
  const projectEnd = new Date('2026-08-31').getTime();
  const totalDurationDays = Math.max(1, (projectEnd - projectStart) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 glow-box space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Project Timeline & Gantt Schedule
              <span className="text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md">
                {project.title}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visual task durations, deadlines, completion bars, and dependency linkages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Overdue / Delayed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Blocked
          </span>
        </div>
      </div>

      {/* Date Header Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px] space-y-4">
          {/* Days Scale Header */}
          <div className="flex items-center border-b border-slate-800 pb-2 text-[11px] font-mono text-slate-500">
            <div className="w-64 font-bold text-slate-400 px-2">Task Title & Assigned</div>
            <div className="flex-1 flex justify-between px-2">
              <span>Aug 20</span>
              <span>Aug 22</span>
              <span>Aug 24</span>
              <span>Aug 26</span>
              <span>Aug 28</span>
              <span>Aug 31</span>
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-3">
            {tasks.map((task) => {
              const statusEval = evaluateTaskDeadlineStatus(task);
              const start = new Date(task.startDate).getTime();
              const end = new Date(task.deadline).getTime();

              const startOffsetDays = Math.max(0, (start - projectStart) / (1000 * 60 * 60 * 24));
              const taskDurationDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));

              const leftPct = (startOffsetDays / totalDurationDays) * 100;
              const widthPct = Math.min(100 - leftPct, (taskDurationDays / totalDurationDays) * 100);

              let barColor = 'bg-cyan-500';
              if (task.status === 'Completed') barColor = 'bg-emerald-500';
              else if (statusEval.isOverdue || task.status === 'Delayed') barColor = 'bg-rose-500';
              else if (task.status === 'Blocked') barColor = 'bg-amber-500';

              return (
                <div key={task.id} className="flex items-center hover:bg-slate-950/60 p-2 rounded-xl border border-transparent hover:border-slate-800 transition-colors">
                  {/* Task Info Sidebar */}
                  <div className="w-64 space-y-0.5 px-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-white truncate max-w-[170px]" title={task.title}>
                        {task.title}
                      </h4>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        {task.completionPct}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[120px]">{task.assignedToName}</span>
                      <span className={statusEval.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                        {statusEval.deadlineLabel}
                      </span>
                    </div>

                    {task.dependencies.length > 0 && (
                      <div className="flex items-center gap-1 text-[9px] font-mono text-amber-400">
                        <Link2 className="w-2.5 h-2.5" />
                        <span>Depends on {task.dependencies.length} task(s)</span>
                      </div>
                    )}
                  </div>

                  {/* Gantt Bar Visualization */}
                  <div className="flex-1 relative h-7 bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80 px-1">
                    <div
                      className={`absolute top-1 bottom-1 rounded-md ${barColor} shadow-md flex items-center justify-between px-2 text-[10px] font-mono font-bold text-slate-950 transition-all`}
                      style={{
                        left: `${Math.max(1, leftPct)}%`,
                        width: `${Math.max(8, widthPct)}%`,
                      }}
                    >
                      <span className="truncate">{task.title}</span>
                      <span>{task.completionPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
