import { Profile, Project, MatchScoreResult, PlaygroundWeights } from '@/types';

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
      // Find original casing from profile or project
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
 * Computes deterministic candidate match score against a project and dynamic weights.
 */
export function calculateCandidateScore(
  profile: Profile,
  project: Project,
  weights: PlaygroundWeights = DEFAULT_WEIGHTS
): MatchScoreResult {
  // Phase 2 Step 1: Deterministic Filtering
  // Hard Filter: Availability check
  const availabilityQualified = profile.availability_hours >= project.required_hours;

  // Availability ratio calculation (capped at 1.0)
  const availabilityRatio = Math.min(
    1.0,
    project.required_hours > 0 ? profile.availability_hours / project.required_hours : 1.0
  );

  // Phase 2 Step 2: Jaccard Similarity
  const { jaccard, intersectionCount } = calculateJaccardSimilarity(
    profile.skills,
    project.required_skills
  );

  // Phase 2 Step 2: Critical Skill Bonus Check
  const { matchesAll: criticalBonusApplied, matchedCriticalSkills } = checkCriticalSkillsMatch(
    profile.skills,
    project.critical_skills
  );

  // Normalize weights so skill + availability sum to 100%
  const totalWeightBase = (weights.skillWeight || 1) + (weights.availabilityWeight || 1);
  const normalizedSkillWeight = (weights.skillWeight / totalWeightBase);
  const normalizedAvailWeight = (weights.availabilityWeight / totalWeightBase);

  // Base Weighted Score (0 to 100)
  let rawScore = (jaccard * normalizedSkillWeight + availabilityRatio * normalizedAvailWeight) * 100;

  // Add Critical Skill Bonus (+15% or dynamic)
  if (criticalBonusApplied) {
    rawScore += weights.criticalBonusWeight;
  }

  // Cap initial raw score at 100
  let finalScore = Math.min(100, Math.max(0, rawScore));

  // Phase 2 Step 2 Hard Gate Rule:
  // Cap total match score at max 40% if skill overlap (Jaccard) < 30% (0.3)
  const hardGated = jaccard < 0.3;
  if (hardGated) {
    finalScore = Math.min(40.0, finalScore);
  }

  return {
    profile,
    project,
    totalScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal place
    jaccardSimilarity: Math.round(jaccard * 100) / 100,
    availabilityRatio: Math.round(availabilityRatio * 100) / 100,
    skillMatchCount: intersectionCount,
    criticalSkillsMatched: matchedCriticalSkills,
    criticalBonusApplied,
    hardGated,
    availabilityQualified,
  };
}

/**
 * Runs matching pipeline for all profiles against a targeted project,
 * enforcing availability filtering, score calculations, and score gate thresholds.
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
      // Deterministic Availability Filter
      if (!includeUnderAvailable && !result.availabilityQualified) {
        return false;
      }
      // Minimum Score Gate Filter
      if (weights.minScoreGate > 0 && result.totalScore < weights.minScoreGate) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.totalScore - a.totalScore); // Rank candidates strictly by score desc
}
