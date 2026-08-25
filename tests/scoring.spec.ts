import { describe, it, expect } from 'vitest';
import { SCORING_WEIGHTS, calculateRecommendationScore, detectAntiPatternTriggers } from '../lib/recommendations/scoring';
import type { StudentState } from '../types/student';
import type { KBCard } from '../types/kb';

describe('scoring weights', () => {
  it('weights are surfaced in one object and sum relevant axes', () => {
    expect(SCORING_WEIGHTS.phaseRelevance).toBe(0.3);
    expect(SCORING_WEIGHTS.goalFit).toBe(0.2);
  });

  it('accumulates every matched signal', () => {
    const score = calculateRecommendationScore({
      inCurrentPhase: true,
      inJourney: true,
      matchesGoal: true,
      matchesConcern: true,
      hoursSuffice: true,
    });
    expect(score).toBeCloseTo(
      SCORING_WEIGHTS.phaseRelevance +
        SCORING_WEIGHTS.journeyPriority +
        SCORING_WEIGHTS.goalFit +
        SCORING_WEIGHTS.concernMatch +
        SCORING_WEIGHTS.hoursFit,
    );
  });

  it('no matches => zero', () => {
    expect(calculateRecommendationScore({ inCurrentPhase: false, inJourney: false, matchesGoal: false, matchesConcern: false, hoursSuffice: false })).toBe(0);
  });
});

const antiCard = (id: string): KBCard => ({ id, type: 'anti-pattern', schemaVersion: '1', title: id, description: '', content: '', degree: 'btech', branch: 'cse', year: 1, goals: [], tags: [], priority: 'high', status: 'published' });

describe('anti-pattern triggers', () => {
  it('flags tutorial-hell for a student with no completed tasks', () => {
    const student = baseStudent({ completedTaskIds: [] });
    const triggered = detectAntiPatternTriggers(student, [antiCard('tutorial-hell-no-projects')]);
    expect(triggered.map((a) => a.id)).toContain('tutorial-hell-no-projects');
  });

  it('does not flag tutorial-hell once tasks are done', () => {
    const student = baseStudent({ completedTaskIds: ['t1'] });
    const triggered = detectAntiPatternTriggers(student, [antiCard('tutorial-hell-no-projects')]);
    expect(triggered).toHaveLength(0);
  });

  it('flags certificate-hoarding when broad and shallow', () => {
    const student = baseStudent({ goals: ['a', 'b', 'c'], skills: ['x', 'y', 'z', 'q'], completedTaskIds: [] });
    const triggered = detectAntiPatternTriggers(student, [antiCard('certificate-hoarding-year-1')]);
    expect(triggered).toHaveLength(1);
  });
});

function baseStudent(overrides: Partial<StudentState> = {}): StudentState {
  const s: StudentState = {
    id: 's1', name: 'T', degree: 'B.Tech', branch: 'CSE', year: 1, semester: 1,
    goals: [], skills: [], interests: [], weeklyHours: 12, learningStyle: 'visual',
    concerns: [], completedTaskIds: [], savedOpportunityIds: [], dismissedWarningIds: [],
    journeyId: 'j', currentPhaseId: 'p1', lastActiveAt: '',
  };
  return { ...s, ...overrides };
}