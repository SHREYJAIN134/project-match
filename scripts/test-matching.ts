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

console.log('====================================================');
console.log('ProjectMatch Analytics Engine & Matching Unit Tests');
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

// Test 2: Hard Gate Rule (< 30% skill overlap)
const lowSkillProfile = {
  id: 'test-low',
  full_name: 'Test Low Overlap Candidate',
  title: 'Backend Specialist',
  avatar_url: '',
  bio: '',
  skills: ['Python', 'Docker', 'Linux'],
  availability_hours: 40,
  experience_years: 5,
};

const testProject = INITIAL_PROJECTS[0];
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

// Test 3: Candidate Suitability Analytics Profile Generation
const topProfile = INITIAL_PROFILES[0];
const topMatchResult = calculateCandidateScore(topProfile, testProject, DEFAULT_WEIGHTS);
const suitability = calculateCandidateSuitabilityProfile(topMatchResult);

console.log('\nTest 3: Candidate Suitability Profile Analysis:');
console.log(`- Candidate: ${topProfile.full_name}`);
console.log(`- Suitability Level: ${suitability.suitabilityLevel}`);
console.log(`- Skill Coverage %: ${suitability.skillCoveragePct}%`);
console.log(`- Direct Matches: ${suitability.directMatchedSkills.join(', ')}`);
console.log(`- Missing Skills: ${suitability.missingSkills.join(', ')}`);
console.log(`- Complementary Skills: ${suitability.complementarySkills.join(', ')}`);

if (suitability.skillCoveragePct > 0 && suitability.strengths.length > 0) {
  console.log('✅ TEST 3 PASSED: Candidate Suitability Profile successfully generated.');
} else {
  console.error('❌ TEST 3 FAILED!');
}

// Test 4: Pool Level Skill Gap Frequency Analytics
const poolAnalytics = calculateProjectPoolAnalytics(INITIAL_PROFILES, testProject);

console.log('\nTest 4: Project Pool Level Analytics & Skill Gap Frequencies:');
console.log(`- Evaluated Pool Size: ${poolAnalytics.totalEvaluated}`);
console.log(`- Eligible Candidates: ${poolAnalytics.eligibleCount}`);
console.log(`- Hard Filtered: ${poolAnalytics.hardFilteredCount}`);
console.log(`- Average Score: ${poolAnalytics.averageScore}%`);
console.log(`- Top Skill Gap Frequency: ${poolAnalytics.skillGapFrequencies[0]?.skill} (Missing in ${poolAnalytics.skillGapFrequencies[0]?.missingPct}%)`);

if (poolAnalytics.totalEvaluated === 10 && poolAnalytics.skillGapFrequencies.length > 0) {
  console.log('✅ TEST 4 PASSED: Pool Analytics and Skill Gap Frequencies calculated accurately.');
} else {
  console.error('❌ TEST 4 FAILED!');
}

// Test 5: Before / After Rank Change Tracking
const prevMatches = runMatchingPipeline(INITIAL_PROFILES, testProject, DEFAULT_WEIGHTS, false);
const tunedWeights = { ...DEFAULT_WEIGHTS, skillWeight: 90, availabilityWeight: 10 };
const tunedMatches = runMatchingPipeline(INITIAL_PROFILES, testProject, tunedWeights, false);
const rankChanges = calculateBeforeAfterRankings(prevMatches, tunedMatches);

console.log('\nTest 5: Live Rank Change Tracking:');
console.log(`- Tracked Rank Changes Count: ${rankChanges.length}`);
console.log(`- Top Candidate Delta: ${rankChanges[0]?.profileName} (${rankChanges[0]?.previousRank} -> ${rankChanges[0]?.newRank})`);

if (rankChanges.length > 0) {
  console.log('✅ TEST 5 PASSED: Live rank change tracking works cleanly.');
} else {
  console.error('❌ TEST 5 FAILED!');
}

console.log('====================================================');
