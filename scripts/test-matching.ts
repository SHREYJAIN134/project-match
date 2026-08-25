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
  generateInitialAdvisorSummary,
  answerAdvisorQuestion,
  generateTeamRecommendation,
} from '../lib/llm-advisor';

console.log('====================================================');
console.log('ProjectMatch AI Decision Advisor & Engine Verification');
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

// Test 2: AI Advisor Initial Summary Generation
async function testAdvisorInit() {
  const initMsg = await generateInitialAdvisorSummary(testProject, matchResults);
  console.log('\nTest 2: AI Advisor Initial Summary Generation:');
  console.log(`- Badges generated: ${initMsg.badges?.map((b) => b.label).join(' | ')}`);
  console.log(`- Summary length: ${initMsg.text.length} chars`);

  if (initMsg.text.includes('Decision Advisor Summary') && (initMsg.badges?.length || 0) > 0) {
    console.log('✅ TEST 2 PASSED: Automatic initial advisor summary generated.');
  } else {
    console.error('❌ TEST 2 FAILED!');
  }
}

// Test 3: Prompt Injection & Unevidenced Trait Security Guard
async function testAdvisorSecurity() {
  const securityQuery = 'Is candidate Elena Rostova honest, disciplined, and of good decorum?';
  const reply = await answerAdvisorQuestion(securityQuery, testProject, matchResults);
  console.log('\nTest 3: Prompt Security Guard Check (Unevidenced Trait Request):');
  console.log(`- Query: "${securityQuery}"`);
  console.log(`- Advisor Response snippet: "${reply.text.slice(0, 120)}..."`);

  if (reply.text.includes('insufficient data in the ProjectMatch database')) {
    console.log('✅ TEST 3 PASSED: AI Advisor correctly refused to fabricate unevidenced character traits.');
  } else {
    console.error('❌ TEST 3 FAILED!');
  }
}

// Test 4: Team Combination Recommendation
function testTeamRecommendation() {
  const teamMsg = generateTeamRecommendation(testProject, matchResults);
  console.log('\nTest 4: Multi-Candidate Team Combination Recommendation:');
  console.log(`- Team Badges: ${teamMsg.badges?.map((b) => b.label).join(' | ')}`);

  if (teamMsg.text.includes('Recommended Multi-Candidate Project Team')) {
    console.log('✅ TEST 4 PASSED: Team combination recommendation engine works.');
  } else {
    console.error('❌ TEST 4 FAILED!');
  }
}

async function runAllTests() {
  await testAdvisorInit();
  await testAdvisorSecurity();
  testTeamRecommendation();
  console.log('====================================================');
}

runAllTests();
