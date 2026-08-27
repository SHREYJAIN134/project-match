import { INITIAL_PROFILES, INITIAL_PROJECTS } from '../lib/seed-data';
import {
  runMatchingPipeline,
  calculateJaccardSimilarity,
  calculateCandidateScore,
  calculateCandidateSuitabilityProfile,
  calculateProjectPoolAnalytics,
  calculateBeforeAfterRankings,
  DEFAULT_WEIGHTS,
} from '../lib/matching';
import {
  calculateProjectHealth,
  evaluateTaskDeadlineStatus,
  calculateTeamWorkload,
  generateSmartAlerts,
  INITIAL_PROJECT_TASKS,
} from '../lib/project-intelligence';

console.log('====================================================');
console.log('ProjectMatch Complete Intelligence Unit Tests');
console.log('====================================================');

const testProject = INITIAL_PROJECTS[0];
const matchResults = runMatchingPipeline(INITIAL_PROFILES, testProject, DEFAULT_WEIGHTS, false);

// Test 1: Jaccard Similarity Formula
const jaccardResult = calculateJaccardSimilarity(
  ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  ['Next.js', 'React', 'TypeScript', 'Supabase']
);
console.log('Test 1: Jaccard Similarity Calculation:');
console.log(`- Expected Intersection: 3 (Next.js, React, TypeScript)`);
console.log(`- Calculated Jaccard: ${jaccardResult.jaccard}`);

if (jaccardResult.intersectionCount === 3) {
  console.log('✅ TEST 1 PASSED: Jaccard Similarity is accurate.');
} else {
  console.error('❌ TEST 1 FAILED!');
}

// Test 2: Project Health Score Calculation
const health = calculateProjectHealth(INITIAL_PROJECT_TASKS, testProject);
console.log('\nTest 2: Project Health Score Calculation:');
console.log(`- Total Tasks: ${health.totalTasks}`);
console.log(`- Completed: ${health.completedTasks}, Active: ${health.inProgressTasks}, Delayed: ${health.delayedTasks}, Blocked: ${health.blockedTasks}`);
console.log(`- Health Score: ${health.healthScore}% (${health.healthStatus})`);

if (health.healthScore > 0 && health.healthStatus !== undefined) {
  console.log('✅ TEST 2 PASSED: Project Health Score calculation works.');
} else {
  console.error('❌ TEST 2 FAILED!');
}

// Test 3: Automatic Deadline & Overdue Monitoring
const overdueTask = INITIAL_PROJECT_TASKS.find((t) => t.id === 'task-105')!;
const statusEval = evaluateTaskDeadlineStatus(overdueTask, '2026-08-25');
console.log('\nTest 3: Automatic Deadline & Overdue Task Detection:');
console.log(`- Task: "${overdueTask.title}"`);
console.log(`- Deadline: ${overdueTask.deadline}`);
console.log(`- Is Overdue: ${statusEval.isOverdue} (${statusEval.overdueDays} days overdue)`);
console.log(`- Deadline Label: "${statusEval.deadlineLabel}"`);

if (statusEval.isOverdue && statusEval.overdueDays === 1) {
  console.log('✅ TEST 3 PASSED: Automatic deadline monitoring correctly flagged overdue task.');
} else {
  console.error('❌ TEST 3 FAILED!');
}

// Test 4: Team Member Workload Analysis
const workloads = calculateTeamWorkload(INITIAL_PROJECT_TASKS, INITIAL_PROFILES);
console.log('\nTest 4: Team Member Workload & Capacity Analysis:');
console.log(`- Team Members Evaluated: ${workloads.length}`);
console.log(`- Top Member: ${workloads[0]?.employeeName} (${workloads[0]?.activeTaskCount} active tasks, Workload: ${workloads[0]?.workloadStatus})`);

if (workloads.length === 10) {
  console.log('✅ TEST 4 PASSED: Team Workload analysis completed successfully.');
} else {
  console.error('❌ TEST 4 FAILED!');
}

// Test 5: Smart Alerts Generation
const alerts = generateSmartAlerts(INITIAL_PROJECT_TASKS);
console.log('\nTest 5: Smart Alerts & Attention Items Generation:');
console.log(`- Alerts Generated: ${alerts.length}`);
console.log(`- Top Alert: [${alerts[0]?.severity}] ${alerts[0]?.title}`);

if (alerts.length > 0) {
  console.log('✅ TEST 5 PASSED: Smart Alerts correctly generated.');
} else {
  console.error('❌ TEST 5 FAILED!');
}

console.log('====================================================');
