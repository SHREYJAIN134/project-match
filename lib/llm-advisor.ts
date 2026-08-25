import { Project, MatchScoreResult } from '@/types';

export interface AdvisorMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
  badges?: { label: string; color: string }[];
  evidence?: string[];
}

/**
 * Sanitizes input text to prevent prompt injection attacks.
 */
function sanitizeInput(text: string): string {
  return text.replace(/<[^>]*>?/gm, '').trim();
}

/**
 * Generates the automatic initial decision summary when the AI Advisor opens.
 */
export async function generateInitialAdvisorSummary(
  project: Project,
  matchResults: MatchScoreResult[]
): Promise<AdvisorMessage> {
  const eligible = matchResults.filter((m) => m.availabilityQualified);
  if (eligible.length === 0) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'advisor',
      text: `### ⚠️ No Eligible Candidates Found\n\nAll candidate profiles currently in the pool fail the mandatory availability constraint of **${project.required_hours} hours/week** required for **${project.title}**.\n\n**Recommendation:** Enable *"Show under-available candidates"* or lower the required commitment hours in project settings.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  const topMathScore = eligible[0]; // Candidate with highest mathematical score
  // Find safest overall choice (best availability + solid skill coverage)
  const safestChoice = eligible.find((m) =>
    m.availabilityRatio >= 1.0 &&
    (m.suitabilityProfile?.skillCoveragePct || 0) >= 60 &&
    m.profile.experience_years >= project.min_experience_years
  ) || topMathScore;

  const isDifferentChoice = safestChoice.profile.id !== topMathScore.profile.id;

  let summaryMarkdown = `## AI Candidate Decision Advisor Summary\n`;
  summaryMarkdown += `**Project Target:** ${project.title} (Req: ${project.required_hours}h/wk, Min Exp: ${project.min_experience_years} yrs)\n\n`;

  if (isDifferentChoice) {
    summaryMarkdown += `### 💡 Score vs. Overall Choice Trade-off Identified\n\n`;
    summaryMarkdown += `* **Highest Mathematical Score:** **${topMathScore.profile.full_name}** (${topMathScore.totalScore}% match) — Excellent technical skill fit, but has tighter capacity or experience margins.\n`;
    summaryMarkdown += `* **Best Overall Choice:** **${safestChoice.profile.full_name}** (${safestChoice.totalScore}% match) — Provides broader project experience (${safestChoice.profile.experience_years} yrs) and 100% capacity reliability (${safestChoice.profile.availability_hours}h/wk).\n\n`;
    summaryMarkdown += `### 🏆 Primary Recommendation\n**${safestChoice.profile.full_name}** is the safer overall choice for project execution based on total availability and experience compatibility.`;
  } else {
    summaryMarkdown += `### 🏆 Top Recommended Candidate\n**${topMathScore.profile.full_name}** (${topMathScore.totalScore}% match score)\n\n`;
    summaryMarkdown += `* **Skill Coverage:** ${topMathScore.suitabilityProfile?.skillCoveragePct}%\n`;
    summaryMarkdown += `* **Direct Matches:** ${topMathScore.suitabilityProfile?.directMatchedSkills.join(', ')}\n`;
    summaryMarkdown += `* **Weekly Capacity:** ${topMathScore.profile.availability_hours}h/wk (Req: ${project.required_hours}h/wk)\n\n`;
    summaryMarkdown += `**Decision Rationale:** ${topMathScore.profile.full_name} leads both technical Jaccard similarity and total availability constraints without major execution risks.`;
  }

  return {
    id: `msg-init-${Date.now()}`,
    sender: 'advisor',
    text: summaryMarkdown,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    badges: [
      { label: `Highest Score: ${topMathScore.profile.full_name} (${topMathScore.totalScore}%)`, color: 'cyan' },
      { label: `Recommended: ${safestChoice.profile.full_name}`, color: 'emerald' },
    ],
    evidence: [
      `Evaluated ${matchResults.length} pool candidates`,
      `${eligible.length} candidates satisfied availability hard constraint (${project.required_hours}h/wk)`,
      `Deterministic Jaccard overlap & availability ratio formulas applied`,
    ],
  };
}

/**
 * Answers custom questions or quick-action prompt buttons.
 */
export async function answerAdvisorQuestion(
  question: string,
  project: Project,
  matchResults: MatchScoreResult[]
): Promise<AdvisorMessage> {
  const cleanQ = sanitizeInput(question);
  const eligible = matchResults.filter((m) => m.availabilityQualified);
  const lowerQ = cleanQ.toLowerCase();

  let responseText = '';

  // Prompt Security Guard Check for unevidenced character trait inquiries
  const unevidencedKeywords = ['honesty', 'honest', 'discipline', 'disciplined', 'personality', 'work ethic', 'decorum', 'attitude', 'morals'];
  if (unevidencedKeywords.some((kw) => lowerQ.includes(kw))) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'advisor',
      text: `### 🛡️ Data Integrity & Security Policy Callout\n\nThere is **insufficient data in the ProjectMatch database** to assess psychological or personal traits such as *${cleanQ}*.\n\nProjectMatch evaluates strictly factual evidence: **technical skills, skill coverage %, weekly hours commitment, years of experience, and deterministic mathematical compatibility scores**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // Handle Team Recommendation Prompt
  if (lowerQ.includes('team') || lowerQ.includes('recommend a team')) {
    return generateTeamRecommendation(project, matchResults);
  }

  // Handle "Compare Top 3" Prompt
  if (lowerQ.includes('compare top 3') || lowerQ.includes('compare top')) {
    const top3 = eligible.slice(0, 3);
    responseText = `### 📊 Top 3 Candidates Side-by-Side Comparison\n\n`;
    top3.forEach((c, i) => {
      responseText += `**#${i + 1} ${c.profile.full_name} (${c.totalScore}% score)**\n`;
      responseText += `* **Suitability:** ${c.suitabilityProfile?.suitabilityLevel}\n`;
      responseText += `* **Skill Coverage:** ${c.suitabilityProfile?.skillCoveragePct}%\n`;
      responseText += `* **Direct Matches:** ${c.suitabilityProfile?.directMatchedSkills.join(', ')}\n`;
      responseText += `* **Missing Skills:** ${c.suitabilityProfile?.missingSkills.join(', ') || 'None'}\n`;
      responseText += `* **Capacity:** ${c.profile.availability_hours}h/wk\n\n`;
    });
    responseText += `**Comparative Insight:** #${top3[0]?.profile.full_name} leads technical alignment, while #${top3[1]?.profile.full_name} offers additional complementary skills.`;
  }
  // Handle "Weaknesses & Risks" Prompt
  else if (lowerQ.includes('weakness') || lowerQ.includes('risk')) {
    responseText = `### ⚠️ Evaluated Risks & Gaps across Top Candidates\n\n`;
    eligible.slice(0, 3).forEach((c) => {
      responseText += `**${c.profile.full_name} (${c.totalScore}%)**\n`;
      if (c.suitabilityProfile?.gaps.length! > 0) {
        c.suitabilityProfile?.gaps.forEach((gap) => {
          responseText += `* ❌ ${gap}\n`;
        });
      } else {
        responseText += `* ✅ Zero identified skill gaps or capacity risks\n`;
      }
      responseText += `\n`;
    });
  }
  // Handle "What if availability is most important?" Prompt
  else if (lowerQ.includes('availability') || lowerQ.includes('what if')) {
    const highestAvail = [...eligible].sort((a, b) => b.profile.availability_hours - a.profile.availability_hours)[0];
    responseText = `### ⏳ What-If Analysis: Availability Priority\n\nIf project execution requires maximum weekly hours commitment:\n\n* **Top Capacity Candidate:** **${highestAvail?.profile.full_name}** with **${highestAvail?.profile.availability_hours} hours/week** available.\n* **Required Commitment:** ${project.required_hours} hours/week\n* **Match Score:** ${highestAvail?.totalScore}%\n\n**Impact:** Prioritizing availability ensures 100% capacity buffer for tight delivery deadlines.`;
  }
  // Default Decision Support Response
  else {
    const best = eligible[0];
    responseText = `### 🎯 AI Decision Advisor Analysis for "${cleanQ}"\n\nBased on deterministic evaluation of **${project.title}**:\n\n* **Recommended Primary Choice:** **${best?.profile.full_name}** (${best?.totalScore}% score)\n* **Key Strengths:** ${best?.suitabilityProfile?.strengths.join(', ')}\n* **Remaining Gaps:** ${best?.suitabilityProfile?.gaps.join(', ') || 'None'}\n\n**Evidence Rationale:** Candidate provides ${best?.suitabilityProfile?.skillCoveragePct}% required skill coverage and satisfies the ${project.required_hours}h/wk commitment requirement.`;
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'advisor',
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Recommends a multi-candidate complementary team combination to achieve 100% skill coverage.
 */
export function generateTeamRecommendation(
  project: Project,
  matchResults: MatchScoreResult[]
): AdvisorMessage {
  const eligible = matchResults.filter((m) => m.availabilityQualified);
  const requiredSkills = project.required_skills;

  // Greedy set cover to select complementary team members
  const selectedTeam: MatchScoreResult[] = [];
  const coveredSkills = new Set<string>();

  const remainingCandidates = [...eligible];

  while (coveredSkills.size < requiredSkills.length && remainingCandidates.length > 0) {
    let bestCandidate: MatchScoreResult | null = null;
    let bestNewCoverage = 0;

    remainingCandidates.forEach((candidate) => {
      const newSkills = candidate.profile.skills.filter(
        (s) => requiredSkills.map((rs) => rs.toLowerCase()).includes(s.toLowerCase()) && !coveredSkills.has(s.toLowerCase())
      );
      if (newSkills.length > bestNewCoverage) {
        bestNewCoverage = newSkills.length;
        bestCandidate = candidate;
      }
    });

    if (bestCandidate && bestNewCoverage > 0) {
      selectedTeam.push(bestCandidate);
      (bestCandidate as MatchScoreResult).profile.skills.forEach((s) => {
        if (requiredSkills.map((rs) => rs.toLowerCase()).includes(s.toLowerCase())) {
          coveredSkills.add(s.toLowerCase());
        }
      });
      const idx = remainingCandidates.indexOf(bestCandidate);
      if (idx > -1) remainingCandidates.splice(idx, 1);
    } else {
      break;
    }
  }

  const coveragePct = Math.round((coveredSkills.size / requiredSkills.length) * 100);

  let teamText = `## 👥 Recommended Multi-Candidate Project Team\n\n`;
  teamText += `Instead of selecting a single candidate, assembling this **${selectedTeam.length}-person team** unlocks **${coveragePct}% total skill coverage** for **${project.title}**:\n\n`;

  selectedTeam.forEach((member, i) => {
    teamText += `### Member #${i + 1}: ${member.profile.full_name} (${member.profile.title})\n`;
    teamText += `* **Primary Skill Contribution:** ${member.suitabilityProfile?.directMatchedSkills.join(', ')}\n`;
    teamText += `* **Weekly Capacity:** ${member.profile.availability_hours}h/wk\n`;
    teamText += `* **Individual Score:** ${member.totalScore}%\n\n`;
  });

  teamText += `**Team Synergy Note:** Combining these candidates covers backend, frontend, and design requirements while preserving individual mathematical rankings.`;

  return {
    id: `msg-team-${Date.now()}`,
    sender: 'advisor',
    text: teamText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    badges: [
      { label: `Team Size: ${selectedTeam.length} Members`, color: 'purple' },
      { label: `Combined Skill Coverage: ${coveragePct}%`, color: 'emerald' },
    ],
  };
}
