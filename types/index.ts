export interface Profile {
  id: string;
  created_at?: string;
  full_name: string;
  title: string;
  avatar_url: string;
  bio: string;
  skills: string[];
  availability_hours: number; // Hours per week candidate can commit
  experience_years: number;
  github_url?: string;
  linkedin_url?: string;
}

export interface Project {
  id: string;
  created_at?: string;
  title: string;
  tagline: string;
  description: string;
  required_skills: string[];
  critical_skills: string[];
  required_hours: number; // Required commitment hours per week
  min_experience_years: number;
  status: 'open' | 'matched' | 'closed';
}

export interface PlaygroundWeights {
  skillWeight: number; // 0 to 100
  availabilityWeight: number; // 0 to 100
  minScoreGate: number; // 0 to 100 (filters out candidates scoring under threshold)
  criticalBonusWeight: number; // 0 to 30%
}

export type SuitabilityLevel = 'Excellent Fit' | 'Strong Fit' | 'Moderate Fit' | 'Weak Fit' | 'Not Suitable';
export type SkillMatchLevel = 'strong' | 'partial' | 'missing' | 'complementary';

export interface SkillAnalysisItem {
  skill: string;
  category: 'required' | 'critical' | 'complementary';
  matchLevel: SkillMatchLevel;
  detail: string;
}

export interface CandidateSuitabilityProfile {
  suitabilityLevel: SuitabilityLevel;
  skillCoveragePct: number; // 0 to 100%
  directMatchCount: number;
  missingSkillCount: number;
  complementarySkillCount: number;
  directMatchedSkills: string[];
  missingSkills: string[];
  complementarySkills: string[];
  experienceQualified: boolean;
  scoreBreakdown: {
    skillFitScore: number;
    availabilityScore: number;
    experienceScore: number;
    criticalBonusScore: number;
  };
  skillAnalysis: SkillAnalysisItem[];
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface MatchScoreResult {
  profile: Profile;
  project: Project;
  totalScore: number; // 0 to 100%
  jaccardSimilarity: number; // 0 to 1.0
  availabilityRatio: number; // 0 to 1.0
  skillMatchCount: number;
  criticalSkillsMatched: string[];
  criticalBonusApplied: boolean;
  hardGated: boolean; // True if skill overlap < 30% capping score at max 40%
  availabilityQualified: boolean; // True if availability_hours >= project.required_hours
  llmExplanation?: string;
  suitabilityProfile?: CandidateSuitabilityProfile;
}

export interface ProjectPoolAnalytics {
  totalEvaluated: number;
  eligibleCount: number;
  hardFilteredCount: number;
  averageScore: number;
  medianScore: number;
  fitDistribution: {
    excellent: number;
    strong: number;
    moderate: number;
    weak: number;
    notSuitable: number;
  };
  skillGapFrequencies: {
    skill: string;
    missingCount: number;
    missingPct: number;
  }[];
  topComplementarySkills: {
    skill: string;
    count: number;
  }[];
}

export interface RankChangeItem {
  profileId: string;
  profileName: string;
  avatarUrl: string;
  previousRank: number;
  newRank: number;
  rankDelta: number; // e.g. +2 means moved up 2 places, -1 means moved down
  previousScore: number;
  newScore: number;
}
