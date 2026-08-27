import {
  ProjectTask,
  ProjectHealthMetrics,
  ProjectHealthStatus,
  TeamWorkloadItem,
  SmartAlertItem,
  ProjectActivityItem,
  Profile,
  Project,
} from '@/types';
import { INITIAL_PROFILES } from './seed-data';

/**
 * Evaluates real-time deadline status and delay risks for a task.
 */
export function evaluateTaskDeadlineStatus(task: ProjectTask, currentDateStr: string = '2026-08-25'): {
  isOverdue: boolean;
  overdueDays: number;
  daysRemaining: number;
  deadlineLabel: string;
  isHighRisk: boolean;
  riskMessage?: string;
} {
  const current = new Date(currentDateStr).getTime();
  const deadline = new Date(task.deadline).getTime();
  const diffTime = deadline - current;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isCompleted = task.status === 'Completed';
  const isOverdue = !isCompleted && diffDays < 0;
  const overdueDays = isOverdue ? Math.abs(diffDays) : 0;
  const daysRemaining = !isCompleted && diffDays >= 0 ? diffDays : 0;

  let deadlineLabel = '';
  if (isCompleted) {
    deadlineLabel = 'Completed';
  } else if (isOverdue) {
    deadlineLabel = `${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue`;
  } else if (diffDays === 0) {
    deadlineLabel = 'Due today';
  } else if (diffDays === 1) {
    deadlineLabel = 'Due tomorrow';
  } else {
    deadlineLabel = `Due in ${diffDays} days`;
  }

  // High Risk Detection: Low completion % with deadline approaching (<= 2 days left or overdue)
  const isHighRisk = !isCompleted && (
    isOverdue ||
    (diffDays <= 2 && task.completionPct < 40) ||
    (task.priority === 'Critical' && task.completionPct < 50)
  );

  let riskMessage: string | undefined = undefined;
  if (!isCompleted) {
    if (isOverdue) {
      riskMessage = `Task is ${overdueDays} day(s) overdue and requires immediate resolution.`;
    } else if (diffDays <= 2 && task.completionPct < 40) {
      riskMessage = `High Risk: Task is only ${task.completionPct}% complete and is due ${diffDays === 1 ? 'tomorrow' : 'in ' + diffDays + ' days'}.`;
    } else if (task.status === 'Blocked') {
      riskMessage = `Task is currently blocked by dependent upstream tasks.`;
    }
  }

  return {
    isOverdue,
    overdueDays,
    daysRemaining,
    deadlineLabel,
    isHighRisk,
    riskMessage,
  };
}

/**
 * Calculates overall Project Health Metrics and Score (0-100%).
 */
export function calculateProjectHealth(tasks: ProjectTask[], project: Project): ProjectHealthMetrics {
  if (!tasks || tasks.length === 0) {
    return {
      healthScore: 100,
      healthStatus: 'On Track',
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      delayedTasks: 0,
      blockedTasks: 0,
      overdueTasks: 0,
      highRiskTasks: 0,
      completionPct: 0,
    };
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const delayedTasks = tasks.filter((t) => t.status === 'Delayed').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;

  const deadlineEvaluations = tasks.map((t) => evaluateTaskDeadlineStatus(t));
  const overdueTasks = deadlineEvaluations.filter((e) => e.isOverdue).length;
  const highRiskTasks = deadlineEvaluations.filter((e) => e.isHighRisk).length;

  // Average Completion %
  const totalCompletionSum = tasks.reduce((sum, t) => sum + t.completionPct, 0);
  const completionPct = Math.round(totalCompletionSum / totalTasks);

  // Weighted Health Score Formula
  // Base: (CompletionPct * 0.4) + 60
  // Deductions: Overdue (-12), Blocked (-10), HighRisk (-8), Delayed (-6)
  let rawScore = (completionPct * 0.4) + 60;
  rawScore -= (overdueTasks * 12);
  rawScore -= (blockedTasks * 10);
  rawScore -= (highRiskTasks * 8);
  rawScore -= (delayedTasks * 6);

  const healthScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let healthStatus: ProjectHealthStatus = 'On Track';
  if (completedTasks === totalTasks) {
    healthStatus = 'Completed';
  } else if (healthScore >= 75) {
    healthStatus = 'On Track';
  } else if (healthScore >= 50) {
    healthStatus = 'At Risk';
  } else {
    healthStatus = 'Delayed';
  }

  return {
    healthScore,
    healthStatus,
    totalTasks,
    completedTasks,
    inProgressTasks,
    delayedTasks,
    blockedTasks,
    overdueTasks,
    highRiskTasks,
    completionPct,
  };
}

/**
 * Calculates Team Member Workload metrics and flags overloaded employees.
 */
export function calculateTeamWorkload(tasks: ProjectTask[], profiles: Profile[]): TeamWorkloadItem[] {
  return profiles.map((prof) => {
    const assignedTasks = tasks.filter((t) => t.assignedToName.toLowerCase() === prof.full_name.toLowerCase());
    const assignedTaskCount = assignedTasks.length;
    const completedTaskCount = assignedTasks.filter((t) => t.status === 'Completed').length;
    const activeTaskCount = assignedTasks.filter((t) => t.status === 'In Progress' || t.status === 'To Do').length;
    const overdueTaskCount = assignedTasks.filter((t) => evaluateTaskDeadlineStatus(t).isOverdue).length;
    const highPriorityCount = assignedTasks.filter((t) => t.priority === 'High' || t.priority === 'Critical').length;

    let workloadStatus: 'Optimal' | 'High' | 'Overloaded' = 'Optimal';
    if (activeTaskCount > 4 || overdueTaskCount >= 2) {
      workloadStatus = 'Overloaded';
    } else if (activeTaskCount >= 3 || highPriorityCount >= 2) {
      workloadStatus = 'High';
    }

    return {
      employeeName: prof.full_name,
      title: prof.title,
      avatarUrl: prof.avatar_url,
      assignedTaskCount,
      activeTaskCount,
      completedTaskCount,
      overdueTaskCount,
      highPriorityCount,
      workloadStatus,
    };
  }).sort((a, b) => b.activeTaskCount - a.activeTaskCount);
}

/**
 * Generates Smart Alerts & Attention Items based on real project events.
 */
export function generateSmartAlerts(tasks: ProjectTask[]): SmartAlertItem[] {
  const alerts: SmartAlertItem[] = [];

  tasks.forEach((t) => {
    const statusEval = evaluateTaskDeadlineStatus(t);

    if (statusEval.isOverdue) {
      alerts.push({
        id: `alert-overdue-${t.id}`,
        severity: 'Critical',
        title: `Task Overdue: ${t.title}`,
        description: `Assigned to ${t.assignedToName} — ${statusEval.overdueDays} day(s) overdue. Completion at ${t.completionPct}%.`,
        taskId: t.id,
        timestamp: t.lastUpdated,
      });
    } else if (t.status === 'Blocked') {
      alerts.push({
        id: `alert-blocked-${t.id}`,
        severity: 'Attention',
        title: `Task Blocked: ${t.title}`,
        description: `${t.blockerComment || 'Blocked by upstream dependency task.'} (Assigned to ${t.assignedToName})`,
        taskId: t.id,
        timestamp: t.lastUpdated,
      });
    } else if (statusEval.isHighRisk) {
      alerts.push({
        id: `alert-risk-${t.id}`,
        severity: 'Warning',
        title: `High Schedule Risk: ${t.title}`,
        description: `${statusEval.riskMessage}`,
        taskId: t.id,
        timestamp: t.lastUpdated,
      });
    }
  });

  return alerts;
}

/**
 * Generates AI Project Insights for the Project Lead.
 */
export function generateAIProjectInsights(
  tasks: ProjectTask[],
  project: Project,
  health: ProjectHealthMetrics
): string {
  if (health.healthStatus === 'Completed') {
    return `🎉 Project is 100% complete! All ${health.totalTasks} tasks have been verified and finalized on target timeline.`;
  }

  let insight = `### AI Executive Project Insight for ${project.title}\n\n`;
  insight += `**Current Status:** **${health.healthStatus}** (Health Score: **${health.healthScore}%**, Overall Completion: **${health.completionPct}%**).\n\n`;

  if (health.overdueTasks > 0) {
    insight += `🔴 **Critical Priority:** ${health.overdueTasks} task(s) are currently overdue. Immediately unblock or reassign tasks assigned to team members facing capacity bottlenecks.\n\n`;
  }

  if (health.blockedTasks > 0) {
    insight += `🟡 **Dependency Blocker:** ${health.blockedTasks} task(s) are blocked by upstream work. Prioritize completion of core dependency tasks.\n\n`;
  }

  if (health.healthStatus === 'On Track') {
    insight += `🟢 **Positive Execution:** Project schedule is progressing smoothly with ${health.completedTasks}/${health.totalTasks} tasks completed. Continue monitoring upcoming deadlines.`;
  } else {
    insight += `⚠️ **Recommended Lead Action:** Review high-risk tasks and consider re-balancing active workload across available team members.`;
  }

  return insight;
}

/* =========================================================================
   INITIAL SEEDED PROJECT TASKS DATASET
   ========================================================================= */

export const INITIAL_PROJECT_TASKS: ProjectTask[] = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    title: 'Supabase Postgres Schema DDL & Vector DB setup',
    description: 'Create profiles, projects, and matches tables with RLS policies.',
    assignedToName: 'Elena Rostova',
    assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    priority: 'Critical',
    status: 'Completed',
    startDate: '2026-08-20',
    deadline: '2026-08-22',
    completionPct: 100,
    dependencies: [],
    lastUpdated: '2026-08-22 14:30',
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    title: 'Deterministic Jaccard & Availability Scoring Engine',
    description: 'Implement Jaccard similarity, critical skill bonus, and hard gate cap rules.',
    assignedToName: 'Elena Rostova',
    assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    priority: 'Critical',
    status: 'Completed',
    startDate: '2026-08-21',
    deadline: '2026-08-23',
    completionPct: 100,
    dependencies: ['task-101'],
    lastUpdated: '2026-08-23 18:00',
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    title: 'Candidate Suitability Analytics & Multi-Dimension Table',
    description: 'Build ranked candidate suitability matrix, skill coverage bars, and side-by-side modal.',
    assignedToName: 'Sophia Patel',
    assignedToAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    priority: 'High',
    status: 'Completed',
    startDate: '2026-08-23',
    deadline: '2026-08-25',
    completionPct: 100,
    dependencies: ['task-102'],
    lastUpdated: '2026-08-25 10:15',
  },
  {
    id: 'task-104',
    projectId: 'proj-1',
    title: 'Groq / Gemini Flash LLM Explanation Microservice',
    description: 'Connect LLM endpoint for top candidate 2-sentence complementarity rationales.',
    assignedToName: 'Aisha Kwame',
    assignedToAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-08-24',
    deadline: '2026-08-26',
    completionPct: 75,
    dependencies: ['task-102'],
    lastUpdated: '2026-08-25 11:30',
  },
  {
    id: 'task-105',
    projectId: 'proj-1',
    title: 'REST API Endpoint & Webhook Integration',
    description: 'Expose candidate match endpoints for external automated webhooks.',
    assignedToName: 'David Vance',
    assignedToAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    priority: 'High',
    status: 'Delayed',
    startDate: '2026-08-22',
    deadline: '2026-08-24', // Overdue
    completionPct: 35,
    dependencies: ['task-101'],
    lastUpdated: '2026-08-24 16:45',
  },
  {
    id: 'task-106',
    projectId: 'proj-1',
    title: 'End-to-End Automated Testing & Load Benchmarking',
    description: 'Run integration test suite across candidate ranking and dashboard views.',
    assignedToName: 'Liam Gallagher',
    assignedToAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    priority: 'Medium',
    status: 'Blocked',
    startDate: '2026-08-24',
    deadline: '2026-08-27',
    completionPct: 10,
    dependencies: ['task-105'],
    blockerComment: 'Blocked by delayed REST API Endpoint task (David Vance).',
    lastUpdated: '2026-08-25 09:00',
  },
  {
    id: 'task-107',
    projectId: 'proj-1',
    title: 'Vercel Serverless Production Deployment & CDN Setup',
    description: 'Deploy production standalone Next.js 15 distribution with environment variables.',
    assignedToName: 'Nadia Benali',
    assignedToAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    priority: 'Critical',
    status: 'To Do',
    startDate: '2026-08-26',
    deadline: '2026-08-28',
    completionPct: 0,
    dependencies: ['task-106'],
    lastUpdated: '2026-08-25 08:30',
  },
];

export const INITIAL_PROJECT_ACTIVITIES: ProjectActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '2026-08-25 10:15',
    actorName: 'Sophia Patel',
    actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    actionType: 'Completed Task',
    taskTitle: 'Candidate Suitability Analytics & Multi-Dimension Table',
    description: 'Marked task as 100% completed.',
  },
  {
    id: 'act-2',
    timestamp: '2026-08-25 09:00',
    actorName: 'Liam Gallagher',
    actorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    actionType: 'Flagged Blocker',
    taskTitle: 'End-to-End Automated Testing & Load Benchmarking',
    description: 'Flagged task as Blocked by delayed REST API Endpoint task.',
  },
  {
    id: 'act-3',
    timestamp: '2026-08-24 16:45',
    actorName: 'System Monitor',
    actorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    actionType: 'Deadline Alert',
    taskTitle: 'REST API Endpoint & Webhook Integration',
    description: 'Task deadline passed without completion (2 days overdue).',
  },
];
