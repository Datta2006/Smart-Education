import { StudentState } from '../../types/student';
import { KBCard } from '../../types/kb';

/**
 * All scoring knobs live here — tuning recommendations is a one-file change.
 */
export const SCORING_WEIGHTS = {
  phaseRelevance: 0.3,
  journeyPriority: 0.25,
  goalFit: 0.2,
  concernMatch: 0.15,
  hoursFit: 0.1,
} as const;

export type ScoreInputs = {
  inCurrentPhase: boolean;
  inJourney: boolean;
  matchesGoal: boolean;
  matchesConcern: boolean;
  hoursSuffice: boolean;
};

export function calculateRecommendationScore(inputs: ScoreInputs): number {
  let score = 0;
  if (inputs.inCurrentPhase) score += SCORING_WEIGHTS.phaseRelevance;
  if (inputs.inJourney) score += SCORING_WEIGHTS.journeyPriority;
  if (inputs.matchesGoal) score += SCORING_WEIGHTS.goalFit;
  if (inputs.matchesConcern) score += SCORING_WEIGHTS.concernMatch;
  if (inputs.hoursSuffice) score += SCORING_WEIGHTS.hoursFit;
  return Math.round(score * 100) / 100;
}

/**
 * Detect anti-pattern triggers for a student. Deterministic rule functions.
 */
export function detectAntiPatternTriggers(
  studentState: StudentState,
  antiPatterns: KBCard[],
): KBCard[] {
  const noCompletedTasks = studentState.completedTaskIds.length === 0;
  const manyGoals = studentState.goals.length >= 3;
  const manySkills = studentState.skills.length >= 4;

  return antiPatterns.filter((ap) => {
    switch (ap.id) {
      case 'tutorial-hell-no-projects':
        return noCompletedTasks;
      case 'certificate-hoarding-year-1':
        return manyGoals && manySkills && noCompletedTasks;
      case 'polyglot-trap-year-1':
        return manySkills && manyGoals;
      case 'ai-ml-fomo-year-1':
        return studentState.goals.some((g) => g.toLowerCase().includes('data')) && noCompletedTasks;
      case 'irrelevant-internships':
        return studentState.goals.includes('placements') && studentState.year >= 1;
      default:
        return false;
    }
  });
}

/**
 * Pick mentor notes whose trigger condition matches the student's state.
 */
export function matchingMentorNotes(studentState: StudentState, mentorNotes: KBCard[]): KBCard[] {
  const noneCompleted = studentState.completedTaskIds.length === 0;
  const lowHours = studentState.weeklyHours < 12;

  return mentorNotes.filter((n) => {
    const cond = n.triggerCondition ?? '';
    if (cond.includes('panic')) return noneCompleted || lowHours;
    if (cond.includes('anxiety')) return true;
    return false;
  });
}