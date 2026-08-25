import { MatchScoreResult } from '@/types';

/**
 * Generates a 2-sentence complementarity rationale for a candidate match using Groq/Gemini API
 * or high-quality deterministic fallback synthesis.
 * Note: Numerical ranking remains 100% deterministic and independent from LLM output.
 */
export async function generateLLMExplanation(matchResult: MatchScoreResult): Promise<string> {
  const { profile, project, totalScore, jaccardSimilarity, criticalBonusApplied, hardGated } = matchResult;

  const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_LLM_API_KEY;

  if (apiKey) {
    try {
      if (process.env.GROQ_API_KEY) {
        // Groq API Endpoint
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are an elite engineering team recruiter. Generate EXACTLY a 2-sentence complementarity rationale explaining why this developer fits the project team based on skills and capacity.'
              },
              {
                role: 'user',
                content: `Candidate: ${profile.full_name} (${profile.title}). Skills: ${profile.skills.join(', ')}. Availability: ${profile.availability_hours}h/wk.
Project: ${project.title}. Required Skills: ${project.required_skills.join(', ')}. Required Commitment: ${project.required_hours}h/wk.
Score: ${totalScore}%. Jaccard Overlap: ${Math.round(jaccardSimilarity * 100)}%.`
              }
            ],
            temperature: 0.3,
            max_tokens: 120
          })
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content.trim();
        }
      }
    } catch (e) {
      console.warn('LLM API call failed, invoking deterministic fallback rationale:', e);
    }
  }

  // High-Quality Deterministic Fallback Generator
  return generateFallbackExplanation(matchResult);
}

/**
 * Deterministic explanation generator producing exact 2-sentence rationales.
 */
function generateFallbackExplanation(matchResult: MatchScoreResult): string {
  const { profile, project, totalScore, criticalBonusApplied, hardGated, criticalSkillsMatched } = matchResult;

  const matchedSkills = profile.skills.filter(s =>
    project.required_skills.map(rs => rs.toLowerCase()).includes(s.toLowerCase())
  );

  let sentence1 = '';
  if (matchedSkills.length > 0) {
    sentence1 = `${profile.full_name} provides strong technical alignment for ${project.title} with core competencies in ${matchedSkills.slice(0, 3).join(', ')}.`;
  } else {
    sentence1 = `${profile.full_name} brings valuable background experience in ${profile.skills.slice(0, 2).join(' and ')}.`;
  }

  let sentence2 = '';
  if (hardGated) {
    sentence2 = `However, total candidate score is capped at 40% due to skill overlap being below the 30% threshold requirement.`;
  } else if (criticalBonusApplied) {
    sentence2 = `Additionally, possessing all critical skills (${criticalSkillsMatched.join(', ')}) unlocks a 15% rank bonus and satisfies weekly commitment of ${profile.availability_hours} hours.`;
  } else if (totalScore >= 70) {
    sentence2 = `With a ${totalScore}% overall match score and ${profile.availability_hours} available weekly hours, this profile represents a high-priority addition to the project team.`;
  } else {
    sentence2 = `Providing ${profile.availability_hours} weekly available hours, candidate meets basic capacity constraints for project delivery.`;
  }

  return `${sentence1} ${sentence2}`;
}

/**
 * Batch generates explanations for top candidate results.
 */
export async function enrichResultsWithExplanations(
  results: MatchScoreResult[],
  topN: number = 5
): Promise<MatchScoreResult[]> {
  const enriched = await Promise.all(
    results.map(async (res, idx) => {
      if (idx < topN) {
        const llmExplanation = await generateLLMExplanation(res);
        return { ...res, llmExplanation };
      } else {
        return res;
      }
    })
  );
  return enriched;
}
