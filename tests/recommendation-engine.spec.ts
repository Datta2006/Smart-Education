import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../lib/recommendations/recommendation-engine';
import type { KBSnapshot } from '../lib/kb/loader';
import type { StudentState } from '../types/student';

const snapshot: KBSnapshot = {
  tasks: [
    {
      id: 'setup-unix-dev-environment', type: 'task', schemaVersion: '1',
      title: 'Setup UNIX Dev Environment', description: 'Sets up a professional local dev environment.',
      content: '# Setup UNIX', degree: 'btech', branch: 'cse', year: 1, phase: 'month-1',
      goals: ['placements'], tags: [], priority: 'high', status: 'published', estimatedHours: 8,
    },
    {
      id: 'start-dsa-striver-a2z', type: 'task', schemaVersion: '1',
      title: 'Start DSA', description: 'Begins structured problem solving.',
      content: '', degree: 'btech', branch: 'cse', year: 1, phase: 'month-1',
      goals: ['placements'], tags: [], priority: 'high', status: 'published', estimatedHours: 60,
    },
  ],
  antiPatterns: [
    {
      id: 'tutorial-hell-no-projects', type: 'anti-pattern', schemaVersion: '1',
      title: 'Tutorial Hell', description: 'Watching without typing.', content: '',
      degree: 'btech', branch: 'cse', year: 1, phase: 'month-1', goals: [], tags: [],
      priority: 'high', status: 'published',
    },
  ],
  decisions: [],
  mentorNotes: [],
  opportunities: [],
  journeys: [
    {
      id: 'year-1-cse', schemaVersion: '1', year: 1, branch: 'cse', title: 'Year 1',
      phases: [
        {
          id: 'phase-1', title: 'Foundation', months: '1-2', focus: 'setup',
          tasks: ['setup-unix-dev-environment', 'start-dsa-striver-a2z'],
          warnings: ['missing-card-not-in-kb'], decisions: [], mentorNotes: [], opportunities: [],
        },
      ],
    },
  ],
};

/**
 * The phase references 'missing-card-not-in-kb' which does not exist in the
 * snapshot — exercising graceful degradation (no throw) in the engine.
 */
const student = (): StudentState => ({
  id: 's1', name: 'T', degree: 'B.Tech', branch: 'CSE', year: 1, semester: 1,
  goals: ['placements'], skills: [], interests: [], weeklyHours: 12, learningStyle: 'visual',
  concerns: [], completedTaskIds: [], savedOpportunityIds: [], dismissedWarningIds: [],
  journeyId: 'year-1-cse', currentPhaseId: 'phase-1', lastActiveAt: '',
});

describe('recommendation-engine', () => {
  it('never throws on a data gap and still returns helper recommendations', () => {
    const result = generateRecommendations({ snapshot, studentState: student() });
    expect(result.recommendations.some((r) => r.actionType === 'warning')).toBe(true);
  });

  it('returns reasons derived from the actual phase data, not templates', () => {
    const result = generateRecommendations({ snapshot, studentState: student() });
    const rec = result.recommendations.find((r) => r.actionType === 'task');
    expect(rec).toBeDefined();
    if (rec) {
      expect(rec.reason).toContain('Foundation');
      expect(rec.reason).toContain(rec.title);
    }
  });

  it('emits the required envelope', () => {
    const result = generateRecommendations({ snapshot, studentState: student() });
    expect(result.generatedAt).toBeDefined();
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});