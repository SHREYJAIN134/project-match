import {
  Profile,
  Project,
  MatchScoreResult,
  PlaygroundWeights,
  CandidateSuitabilityProfile,
  SuitabilityLevel,
  SkillAnalysisItem,
  ProjectPoolAnalytics,
  RankChangeItem,
} from '@/types';

/**
 * Default playground weights configuration
 */
export const DEFAULT_WEIGHTS: PlaygroundWeights = {
  skillWeight: 60,
  availabilityWeight: 40,
  minScoreGate: 0,
  criticalBonusWeight: 15,
};

/**
 * Normalizes skill string for accurate casing comparison
 */
function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

/**
 * Calculates Jaccard Similarity between profile skills and project required skills.
 * Jaccard = |Intersection(ProfileSkills, ProjectSkills)| / |Union(ProfileSkills, ProjectSkills)|
 */
export function calculateJaccardSimilarity(profileSkills: string[], projectSkills: string[]): {
  jaccard: number;
  intersectionCount: number;
  intersectionSkills: string[];
} {
  if (!projectSkills || projectSkills.length === 0) {
    return { jaccard: 1.0, intersectionCount: 0, intersectionSkills: [] };
  }
  if (!profileSkills || profileSkills.length === 0) {
    return { jaccard: 0, intersectionCount: 0, intersectionSkills: [] };
  }

  const profNormalized = new Set(profileSkills.map(normalizeSkill));
  const projNormalized = new Set(projectSkills.map(normalizeSkill));

  const intersection: string[] = [];
  projNormalized.forEach((skill) => {
    if (profNormalized.has(skill)) {
      const match = profileSkills.find((s) => normalizeSkill(s) === skill) || skill;
      intersection.push(match);
    }
  });

  const union = new Set([...profNormalized, ...projNormalized]);
  const jaccard = union.size > 0 ? intersection.length / union.size : 0;

  return {
    jaccard,
    intersectionCount: intersection.length,
    intersectionSkills: intersection,
  };
}

/**
 * Checks if profile satisfies all critical skills defined for the project.
 */
export function checkCriticalSkillsMatch(profileSkills: string[], criticalSkills: string[]): {
  matchesAll: boolean;
  matchedCriticalSkills: string[];
} {
  if (!criticalSkills || criticalSkills.length === 0) {
    return { matchesAll: false, matchedCriticalSkills: [] };
  }

  const profNormalized = new Set(profileSkills.map(normalizeSkill));
  const matched: string[] = [];

  criticalSkills.forEach((critSkill) => {
    if (profNormalized.has(normalizeSkill(critSkill))) {
      matched.push(critSkill);
    }
  });

  return {
    matchesAll: matched.length === criticalSkills.length,
    matchedCriticalSkills: matched,
  };
}

/**
 * Generates a comprehensive Suitability Analytics Profile for a candidate match.
 */
export function calculateCandidateSuitabilityProfile(matchResult: MatchScoreResult): CandidateSuitabilityProfile {
  const { profile, project, totalScore, jaccardSimilarity, availabilityRatio, criticalBonusApplied, hardGated, availabilityQualified } = matchResult;

  const profSkillsLower = profile.skills.map(normalizeSkill);
  const reqSkillsLower = project.required_skills.map(normalizeSkill);

  // Direct Matched Skills
  const directMatchedSkills = profile.skills.filter((s) => reqSkillsLower.includes(normalizeSkill(s)));

  // Missing Required Skills
  const missingSkills = project.required_skills.filter((rs) => !profSkillsLower.includes(normalizeSkill(rs)));

  // Complementary Skills (Skills candidate has that are NOT in project required skills)
  const complementarySkills = profile.skills.filter((s) => !reqSkillsLower.includes(normalizeSkill(s)));

  // Skill Coverage Percentage
  const totalReqCount = project.required_skills.length;
  const skillCoveragePct = totalReqCount > 0 ? Math.round((directMatchedSkills.length / totalReqCount) * 100) : 100;

  // Experience qualification
  const experienceQualified = profile.experience_years >= project.min_experience_years;

  // Determine Suitability Level
  let suitabilityLevel: SuitabilityLevel = 'Moderate Fit';
  if (!availabilityQualified) {
    suitabilityLevel = 'Not Suitable';
  } else if (totalScore >= 80) {
    suitabilityLevel = 'Excellent Fit';
  } else if (totalScore >= 70) {
    suitabilityLevel = 'Strong Fit';
  } else if (totalScore >= 50) {
    suitabilityLevel = 'Moderate Fit';
  } else if (totalScore >= 30) {
    suitabilityLevel = 'Weak Fit';
  } else {
    suitabilityLevel = 'Not Suitable';
  }

  // Score Component Breakdown
  const experienceScore = Math.min(100, Math.round((profile.experience_years / Math.max(1, project.min_experience_years)) * 100));

  const scoreBreakdown = {
    skillFitScore: Math.round(jaccardSimilarity * 100),
    availabilityScore: Math.round(availabilityRatio * 100),
    experienceScore,
    criticalBonusScore: criticalBonusApplied ? 15 : 0,
  };

  // Detailed Skill Analysis Items
  const skillAnalysis: SkillAnalysisItem[] = project.required_skills.map((reqSkill) => {
    const isMatched = profSkillsLower.includes(normalizeSkill(reqSkill));
    const isCritical = project.critical_skills.map(normalizeSkill).includes(normalizeSkill(reqSkill));
    return {
      skill: reqSkill,
      category: isCritical ? 'critical' : 'required',
      matchLevel: isMatched ? 'strong' : 'missing',
      detail: isMatched
        ? `Direct match found in profile`
        : `Missing mandatory project skill`,
    };
  });

  // Add Complementary Skills to Analysis
  complementarySkills.forEach((compSkill) => {
    skillAnalysis.push({
      skill: compSkill,
      category: 'complementary',
      matchLevel: 'complementary',
      detail: `Additional capability offered beyond project baseline`,
    });
  });

  // Fact-Based Strengths
  const strengths: string[] = [];
  if (directMatchedSkills.length > 0) {
    strengths.push(`Matches ${directMatchedSkills.length}/${totalReqCount} required skills (${directMatchedSkills.slice(0, 3).join(', ')})`);
  }
  if (criticalBonusApplied) {
    strengths.push(`Possesses 100% of critical project skills (+15% bonus unlocked)`);
  }
  if (availabilityQualified) {
    strengths.push(`Sufficient capacity (${profile.availability_hours}h/wk vs ${project.required_hours}h required)`);
  }
  if (experienceQualified) {
    strengths.push(`Solid experience track record (${profile.experience_years} years vs ${project.min_experience_years} years required)`);
  }
  if (complementarySkills.length > 0) {
    strengths.push(`Provides ${complementarySkills.length} complementary skills (${complementarySkills.slice(0, 3).join(', ')})`);
  }

  // Fact-Based Gaps & Risks
  const gaps: string[] = [];
  if (!availabilityQualified) {
    gaps.push(`Fails availability hard constraint (${profile.availability_hours}h available vs ${project.required_hours}h required)`);
  }
  if (hardGated) {
    gaps.push(`Low skill overlap (<30% Jaccard) triggered hard score cap at 40%`);
  }
  if (missingSkills.length > 0) {
    gaps.push(`Lacks ${missingSkills.length} required project skills (${missingSkills.join(', ')})`);
  }
  if (!experienceQualified) {
    gaps.push(`Experience below target (${profile.experience_years} yrs vs ${project.min_experience_years} yrs minimum)`);
  }

  // Deterministic Recommendation Rationale
  let recommendation = '';
  if (!availabilityQualified) {
    recommendation = `NOT RECOMMENDED for selection due to capacity deficit (${profile.availability_hours}h/wk available vs ${project.required_hours}h required).`;
  } else if (totalScore >= 75) {
    recommendation = `HIGHLY RECOMMENDED: Candidate exhibits top-tier skill alignment (${skillCoveragePct}% coverage) and meets capacity constraints.`;
  } else if (totalScore >= 55) {
    recommendation = `RECOMMENDED WITH TARGETED MENTORSHIP: Candidate offers solid core competencies but has skill gaps in ${missingSkills.slice(0, 2).join(', ')}.`;
  } else {
    recommendation = `CONSIDER ALTERNATIVES: Low skill compatibility (${skillCoveragePct}% coverage) presents significant project execution risk.`;
  }

  return {
    suitabilityLevel,
    skillCoveragePct,
    directMatchCount: directMatchedSkills.length,
    missingSkillCount: missingSkills.length,
    complementarySkillCount: complementarySkills.length,
    directMatchedSkills,
    missingSkills,
    complementarySkills,
    experienceQualified,
    scoreBreakdown,
    skillAnalysis,
    strengths,
    gaps,
    recommendation,
  };
}

/**
 * Computes deterministic candidate match score against a project and dynamic weights.
 */
export function calculateCandidateScore(
  profile: Profile,
  project: Project,
  weights: PlaygroundWeights = DEFAULT_WEIGHTS
): MatchScoreResult {
  const availabilityQualified = profile.availability_hours >= project.required_hours;

  const availabilityRatio = Math.min(
    1.0,
    project.required_hours > 0 ? profile.availability_hours / project.required_hours : 1.0
  );

  const { jaccard, intersectionCount } = calculateJaccardSimilarity(
    profile.skills,
    project.required_skills
  );

  const { matchesAll: criticalBonusApplied, matchedCriticalSkills } = checkCriticalSkillsMatch(
    profile.skills,
    project.critical_skills
  );

  const totalWeightBase = (weights.skillWeight || 1) + (weights.availabilityWeight || 1);
  const normalizedSkillWeight = weights.skillWeight / totalWeightBase;
  const normalizedAvailWeight = weights.availabilityWeight / totalWeightBase;

  let rawScore = (jaccard * normalizedSkillWeight + availabilityRatio * normalizedAvailWeight) * 100;

  if (criticalBonusApplied) {
    rawScore += weights.criticalBonusWeight;
  }

  let finalScore = Math.min(100, Math.max(0, rawScore));

  const hardGated = jaccard < 0.3;
  if (hardGated) {
    finalScore = Math.min(40.0, finalScore);
  }

  const resultBase: MatchScoreResult = {
    profile,
    project,
    totalScore: Math.round(finalScore * 10) / 10,
    jaccardSimilarity: Math.round(jaccard * 100) / 100,
    availabilityRatio: Math.round(availabilityRatio * 100) / 100,
    skillMatchCount: intersectionCount,
    criticalSkillsMatched: matchedCriticalSkills,
    criticalBonusApplied,
    hardGated,
    availabilityQualified,
  };

  // Attach suitability profile
  resultBase.suitabilityProfile = calculateCandidateSuitabilityProfile(resultBase);

  return resultBase;
}

/**
 * Runs matching pipeline for all profiles against a targeted project,
 * returning both qualified and optionally under-available candidates.
 */
export function runMatchingPipeline(
  profiles: Profile[],
  project: Project,
  weights: PlaygroundWeights = DEFAULT_WEIGHTS,
  includeUnderAvailable: boolean = false
): MatchScoreResult[] {
  return profiles
    .map((profile) => calculateCandidateScore(profile, project, weights))
    .filter((result) => {
      if (!includeUnderAvailable && !result.availabilityQualified) {
        return false;
      }
      if (weights.minScoreGate > 0 && result.totalScore < weights.minScoreGate) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Calculates project pool analytics across all candidates in the database.
 */
export function calculateProjectPoolAnalytics(allProfiles: Profile[], project: Project): ProjectPoolAnalytics {
  const allEvaluated = allProfiles.map((p) => calculateCandidateScore(p, project, DEFAULT_WEIGHTS));

  const totalEvaluated = allEvaluated.length;
  const eligibleCount = allEvaluated.filter((e) => e.availabilityQualified).length;
  const hardFilteredCount = totalEvaluated - eligibleCount;

  const scores = allEvaluated.map((e) => e.totalScore).sort((a, b) => a - b);
  const averageScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
  const medianScore = scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0;

  const fitDistribution = {
    excellent: 0,
    strong: 0,
    moderate: 0,
    weak: 0,
    notSuitable: 0,
  };

  allEvaluated.forEach((item) => {
    const level = item.suitabilityProfile?.suitabilityLevel;
    if (level === 'Excellent Fit') fitDistribution.excellent++;
    else if (level === 'Strong Fit') fitDistribution.strong++;
    else if (level === 'Moderate Fit') fitDistribution.moderate++;
    else if (level === 'Weak Fit') fitDistribution.weak++;
    else fitDistribution.notSuitable++;
  });

  // Calculate Skill Gap Frequencies across the candidate pool
  const skillGapFrequencies = project.required_skills.map((reqSkill) => {
    const missingCount = allEvaluated.filter((res) =>
      !res.profile.skills.map(normalizeSkill).includes(normalizeSkill(reqSkill))
    ).length;
    const missingPct = totalEvaluated > 0 ? Math.round((missingCount / totalEvaluated) * 100) : 0;
    return {
      skill: reqSkill,
      missingCount,
      missingPct,
    };
  }).sort((a, b) => b.missingPct - a.missingPct);

  // Top Complementary Skills brought by pool candidates
  const compSkillMap: Record<string, number> = {};
  allEvaluated.forEach((res) => {
    res.suitabilityProfile?.complementarySkills.forEach((skill) => {
      compSkillMap[skill] = (compSkillMap[skill] || 0) + 1;
    });
  });

  const topComplementarySkills = Object.entries(compSkillMap)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEvaluated,
    eligibleCount,
    hardFilteredCount,
    averageScore,
    medianScore,
    fitDistribution,
    skillGapFrequencies,
    topComplementarySkills,
  };
}

/**
 * Tracks rank changes between previous matches and new matches after playground tuning.
 */
export function calculateBeforeAfterRankings(
  previousMatches: MatchScoreResult[],
  newMatches: MatchScoreResult[]
): RankChangeItem[] {
  const prevRankMap = new Map<string, { rank: number; score: number }>();
  previousMatches.forEach((m, idx) => {
    prevRankMap.set(m.profile.id, { rank: idx + 1, score: m.totalScore });
  });

  return newMatches.map((newMatch, newIdx) => {
    const newRank = newIdx + 1;
    const prev = prevRankMap.get(newMatch.profile.id);
    const previousRank = prev ? prev.rank : newRank;
    const previousScore = prev ? prev.score : newMatch.totalScore;
    const rankDelta = previousRank - newRank; // positive = moved up in rank

    return {
      profileId: newMatch.profile.id,
      profileName: newMatch.profile.full_name,
      avatarUrl: newMatch.profile.avatar_url,
      previousRank,
      newRank,
      rankDelta,
      previousScore,
      newScore: newMatch.totalScore,
    };
  });
}
