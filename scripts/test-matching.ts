import { INITIAL_PROFILES, INITIAL_PROJECTS } from '../lib/seed-data';
import { runMatchingPipeline, calculateJaccardSimilarity, checkCriticalSkillsMatch, calculateCandidateScore, DEFAULT_WEIGHTS } from '../lib/matching';

console.log('====================================================');
console.log('ProjectMatch Deterministic Engine Verification Tests');
console.log('====================================================');

// Test 1: Jaccard Similarity Formula
const jaccardResult = calculateJaccardSimilarity(
  ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
  ['Next.js', 'React', 'TypeScript', 'Supabase']
);
console.log('Test 1: Jaccard Similarity Calculation:');
console.log(`- Expected Intersection: 3 (Next.js, React, TypeScript)`);
console.log(`- Calculated Jaccard: ${jaccardResult.jaccard} (Intersection count: ${jaccardResult.intersectionCount})`);

if (jaccardResult.intersectionCount === 3 && Math.abs(jaccardResult.jaccard - 0.6) < 0.01) {
  console.log('✅ TEST 1 PASSED: Jaccard Similarity is mathematically accurate.');
} else {
  console.error('❌ TEST 1 FAILED!');
}

// Test 2: Hard Gate Rule (< 30% overlap capped at 40%)
const lowSkillProfile = {
  id: 'test-low',
  full_name: 'Test Low Overlap Candidate',
  title: 'Backend Specialist',
  avatar_url: '',
  bio: '',
  skills: ['Python', 'Docker', 'Linux'], // Only 1 overlapping skill out of many
  availability_hours: 40,
  experience_years: 5,
};

const testProject = INITIAL_PROJECTS[0]; // Requires 7 skills
const lowScoreResult = calculateCandidateScore(lowSkillProfile, testProject, DEFAULT_WEIGHTS);

console.log('\nTest 2: Hard Gate Rule (< 30% skill overlap):');
console.log(`- Jaccard Similarity: ${lowScoreResult.jaccardSimilarity}`);
console.log(`- Hard Gated Flag: ${lowScoreResult.hardGated}`);
console.log(`- Total Score: ${lowScoreResult.totalScore}%`);

if (lowScoreResult.hardGated && lowScoreResult.totalScore <= 40.0) {
  console.log('✅ TEST 2 PASSED: Hard Gate Rule correctly caps score at 40%.');
} else {
  console.error('❌ TEST 2 FAILED!');
}

// Test 3: Deterministic Availability Filtering
const underAvailProfile = {
  id: 'test-under',
  full_name: 'Test Under Available Candidate',
  title: 'Full Stack Dev',
  avatar_url: '',
  bio: '',
  skills: testProject.required_skills,
  availability_hours: 10, // Under project requirement of 25h
  experience_years: 5,
};

const pipelineWithoutUnder = runMatchingPipeline([underAvailProfile], testProject, DEFAULT_WEIGHTS, false);
const pipelineWithUnder = runMatchingPipeline([underAvailProfile], testProject, DEFAULT_WEIGHTS, true);

console.log('\nTest 3: Deterministic Availability Filter:');
console.log(`- Filtered out under-available (default): ${pipelineWithoutUnder.length === 0}`);
console.log(`- Included when forced: ${pipelineWithUnder.length === 1}`);

if (pipelineWithoutUnder.length === 0 && pipelineWithUnder.length === 1) {
  console.log('✅ TEST 3 PASSED: Availability filter correctly excludes profiles with insufficient hours.');
} else {
  console.error('❌ TEST 3 FAILED!');
}

console.log('====================================================');
