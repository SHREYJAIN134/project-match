'use client';

import React, { useState } from 'react';
import { ProjectTask, Profile } from '@/types';
import { evaluateTaskDeadlineStatus } from '@/lib/project-intelligence';
import { CheckCircle2, Clock, AlertTriangle, Link2, MessageSquare, UserCheck, ShieldAlert, Sparkles, Filter } from 'lucide-react';

interface EmployeeMyTasksProps {
  tasks: ProjectTask[];
  profiles: Profile[];
  onUpdateTaskStatus: (taskId: string, newStatus: ProjectTask['status'], newCompletionPct: number, blockerComment?: string) => void;
}

export function EmployeeMyTasks({ tasks, profiles, onUpdateTaskStatus }: EmployeeMyTasksProps) {
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>(profiles[0]?.full_name || 'Elena Rostova');
  const [filterCategory, setFilterCategory] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  const employeeTasks = tasks.filter((t) => t.assignedToName.toLowerCase() === selectedEmployeeName.toLowerCase());

  const filteredTasks = employeeTasks.filter((task) => {
    const statusEval = evaluateTaskDeadlineStatus(task);
    if (filterCategory === 'active') return task.status === 'In Progress' || task.status === 'To Do' || task.status === 'Blocked';
    if (filterCategory === 'completed') return task.status === 'Completed';
    if (filterCategory === 'overdue') return statusEval.isOverdue;
    return true;
  });

  const activeEmployee = profiles.find((p) => p.full_name.toLowerCase() === selectedEmployeeName.toLowerCase());

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 glow-box space-y-6">
      {/* Employee Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Employee Workspace & My Tasks
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-md">
                Personal Control Center
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Update task progress, completion percentage, and log blockers for project lead visibility
            </p>
          </div>
        </div>

        {/* Employee Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400">Simulate Employee:</label>
          <select
            value={selectedEmployeeName}
            onChange={(e) => setSelectedEmployeeName(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
          >
            {profiles.map((prof) => (
              <option key={prof.id} value={prof.full_name}>
                {prof.full_name} ({prof.title})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Employee Summary Card */}
      {activeEmployee && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activeEmployee.avatar_url}
              alt={activeEmployee.full_name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <h4 className="font-bold text-white text-sm">{activeEmployee.full_name}</h4>
              <p className="text-xs text-slate-400">{activeEmployee.title}</p>
              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">Availability: {activeEmployee.availability_hours}h/wk</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'all' ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              All ({employeeTasks.length})
            </button>
            <button
              onClick={() => setFilterCategory('active')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'active' ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Active ({employeeTasks.filter((t) => t.status !== 'Completed').length})
            </button>
            <button
              onClick={() => setFilterCategory('completed')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'completed' ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Completed ({employeeTasks.filter((t) => t.status === 'Completed').length})
            </button>
          </div>
        </div>
      )}

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
            No assigned tasks found for current filter.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const statusEval = evaluateTaskDeadlineStatus(task);

            return (
              <div
                key={task.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all"
              >
                {/* Task Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        task.priority === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        task.priority === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {task.priority} Priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className={`px-3 py-1 rounded-lg border font-bold ${
                      task.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      task.status === 'Blocked' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      statusEval.isOverdue ? 'bg-rose-950 text-rose-300 border-rose-800' :
                      'bg-cyan-950 text-cyan-300 border-cyan-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Deadline & Blocker Warnings */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  <span className={`flex items-center gap-1 ${statusEval.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {task.deadline} ({statusEval.deadlineLabel})
                  </span>

                  {task.status === 'Blocked' && task.blockerComment && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Blocker: {task.blockerComment}
                    </span>
                  )}
                </div>

                {/* Interactive Status & Progress Slider Controls */}
                <div className="pt-3 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                      <span>Update Completion %</span>
                      <span className="text-cyan-400 font-bold">{task.completionPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.completionPct}
                      onChange={(e) => {
                        const newPct = Number(e.target.value);
                        const newStatus = newPct === 100 ? 'Completed' : newPct > 0 ? 'In Progress' : 'To Do';
                        onUpdateTaskStatus(task.id, newStatus, newPct);
                      }}
                      className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onUpdateTaskStatus(task.id, 'Completed', 100)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold transition-all"
                    >
                      Mark Completed (100%)
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt('Describe the blocker preventing progress on this task:');
                        if (comment) {
                          onUpdateTaskStatus(task.id, 'Blocked', task.completionPct, comment);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-mono font-bold transition-all"
                    >
                      Log Blocker
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
