'use client';

import React, { useState } from 'react';
import { ProjectTask, ProjectHealthMetrics, Project, Profile, SmartAlertItem, ProjectActivityItem } from '@/types';
import { evaluateTaskDeadlineStatus, generateSmartAlerts, generateAIProjectInsights } from '@/lib/project-intelligence';
import {
  ShieldAlert,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Plus,
  Search,
  Filter,
  Bot,
  Calendar,
  Layers,
  ArrowRight,
  User,
  Link2,
} from 'lucide-react';

interface ProjectLeadDashboardProps {
  project: Project;
  tasks: ProjectTask[];
  profiles: Profile[];
  health: ProjectHealthMetrics;
  activities: ProjectActivityItem[];
  onAddTask: (task: Omit<ProjectTask, 'id' | 'lastUpdated'>) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: ProjectTask['status'], newCompletionPct: number, blockerComment?: string) => void;
}

export function ProjectLeadDashboard({
  project,
  tasks,
  profiles,
  health,
  activities,
  onAddTask,
  onUpdateTaskStatus,
}: ProjectLeadDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'inprogress' | 'completed' | 'delayed' | 'blocked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');

  // Task creation form modal state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignee, setNewAssignee] = useState(profiles[0]?.full_name || 'Elena Rostova');
  const [newPriority, setNewPriority] = useState<ProjectTask['priority']>('High');
  const [newDeadline, setNewDeadline] = useState('2026-08-28');
  const [newDependencies, setNewDependencies] = useState<string[]>([]);

  const smartAlerts = generateSmartAlerts(tasks);
  const aiInsight = generateAIProjectInsights(tasks, project, health);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const statusEval = evaluateTaskDeadlineStatus(task);
    if (activeTab === 'todo' && task.status !== 'To Do') return false;
    if (activeTab === 'inprogress' && task.status !== 'In Progress') return false;
    if (activeTab === 'completed' && task.status !== 'Completed') return false;
    if (activeTab === 'delayed' && !statusEval.isOverdue && task.status !== 'Delayed') return false;
    if (activeTab === 'blocked' && task.status !== 'Blocked') return false;

    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (selectedAssignee !== 'all' && task.assignedToName.toLowerCase() !== selectedAssignee.toLowerCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.assignedToName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedProf = profiles.find((p) => p.full_name === newAssignee) || profiles[0];

    onAddTask({
      projectId: project.id,
      title: newTitle,
      description: newDescription,
      assignedToName: assignedProf.full_name,
      assignedToAvatar: assignedProf.avatar_url,
      priority: newPriority,
      status: 'To Do',
      startDate: '2026-08-25',
      deadline: newDeadline,
      completionPct: 0,
      dependencies: newDependencies,
    });

    setNewTitle('');
    setNewDescription('');
    setIsCreateTaskOpen(false);
  };

  // Health Status Badge Color
  let healthBadgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-800';
  if (health.healthStatus === 'At Risk') healthBadgeStyle = 'bg-amber-950 text-amber-300 border-amber-800';
  else if (health.healthStatus === 'Delayed') healthBadgeStyle = 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse';

  return (
    <div className="space-y-8">
      {/* KPI Overview Cards Header */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Project Health Score */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glow-box col-span-2 sm:col-span-1">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Project Health Score</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">{health.healthScore}%</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${healthBadgeStyle}`}>
              {health.healthStatus}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${health.healthScore}%` }} />
          </div>
        </div>

        {/* Overall Completion % */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glow-box">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Overall Progress</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">{health.completionPct}%</p>
          <p className="text-[10px] text-slate-500">{health.completedTasks} / {health.totalTasks} Tasks Done</p>
        </div>

        {/* In Progress Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glow-box">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Active Tasks</p>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{health.inProgressTasks}</p>
          <p className="text-[10px] text-slate-500">Currently in progress</p>
        </div>

        {/* Overdue Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glow-box">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Overdue Tasks</p>
          <p className="text-2xl font-extrabold text-rose-400 font-mono mt-1">{health.overdueTasks}</p>
          <p className="text-[10px] text-slate-500">Passed deadline</p>
        </div>

        {/* Blocked Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glow-box">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Blocked Tasks</p>
          <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{health.blockedTasks}</p>
          <p className="text-[10px] text-slate-500">Upstream dependencies</p>
        </div>

        {/* High Risk Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glow-box">
          <p className="text-[10px] font-mono text-slate-400 uppercase">High Schedule Risks</p>
          <p className="text-2xl font-extrabold text-purple-400 font-mono mt-1">{health.highRiskTasks}</p>
          <p className="text-[10px] text-slate-500">Low progress near due</p>
        </div>
      </div>

      {/* AI Executive Project Insight & Smart Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Executive Insight Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-indigo-900/80 rounded-2xl p-6 glow-box-purple space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs font-bold">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>AI Executive Project Intelligence Insight</span>
          </div>
          <div className="prose prose-invert prose-xs text-xs text-slate-200 leading-relaxed font-sans">
            {aiInsight.split('\n').map((line, idx) => {
              if (line.startsWith('### ')) return <h4 key={idx} className="text-sm font-bold text-white font-mono mt-1">{line.replace('### ', '')}</h4>;
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </div>

        {/* Smart Alerts Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 glow-box space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Smart Alerts & Attention
            </h4>
            <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded">
              {smartAlerts.length} Alerts
            </span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {smartAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">No critical alerts detected.</p>
            ) : (
              smartAlerts.map((alert) => (
                <div key={alert.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-[11px] ${
                      alert.severity === 'Critical' ? 'text-rose-400' :
                      alert.severity === 'Warning' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{alert.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Management Control Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 glow-box space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Project Control Center & Tasks</h3>
          </div>

          <button
            onClick={() => setIsCreateTaskOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            {(['all', 'todo', 'inprogress', 'completed', 'delayed', 'blocked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-lg uppercase text-[10px] font-bold transition-all ${
                  activeTab === tab ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Assignee Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks or assignees..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">All Team Members</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.full_name}>{p.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Task & Description</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4 text-center">Priority</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Completion %</th>
                <th className="py-3 px-4">Deadline & Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTasks.map((task) => {
                const statusEval = evaluateTaskDeadlineStatus(task);

                return (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{task.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{task.description}</p>
                      {task.dependencies.length > 0 && (
                        <span className="text-[10px] font-mono text-amber-400 inline-flex items-center gap-1 mt-0.5">
                          <Link2 className="w-2.5 h-2.5" /> Depends on {task.dependencies.length} task(s)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <img src={task.assignedToAvatar} alt={task.assignedToName} className="w-7 h-7 rounded-lg object-cover border border-slate-700" />
                        <span className="font-medium text-slate-200 text-xs">{task.assignedToName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        task.priority === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {task.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        task.status === 'Blocked' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        statusEval.isOverdue ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {task.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <div className="w-20 mx-auto">
                        <span className="text-cyan-400 font-bold">{task.completionPct}%</span>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-cyan-500" style={{ width: `${task.completionPct}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className={statusEval.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {task.deadline}
                      </span>
                      <span className={`block text-[10px] ${statusEval.isOverdue ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                        {statusEval.deadlineLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'Completed', 100)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-mono border border-slate-700"
                      >
                        Complete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 glow-box">
            <h3 className="text-base font-bold text-white mb-4">Create & Assign New Task</h3>
            <form onSubmit={handleCreateTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Authentication Module"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Task requirements and scope..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Assign To</label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.full_name}>{p.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ProjectTask['priority'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 font-bold text-xs text-slate-950"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
