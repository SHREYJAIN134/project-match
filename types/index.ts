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
}
