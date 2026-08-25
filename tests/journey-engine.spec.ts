import { describe, it, expect } from 'vitest';
import { getJourneyView, buildCardsById, currentPhaseTasksDone } from '../lib/journey/journey-engine';
import type { JourneyFile, KBCard, JourneyPhase } from '../types/kb';

const task = (id: string): KBCard => ({
  id,
  type: 'task',
  schemaVersion: '1',
  title: id,
  description: '',
  content: '',
  degree: 'btech',
  branch: 'cse',
  year: 1,
  goals: [],
  tags: [],
  priority: 'high',
  status: 'published',
  estimatedHours: 4,
});

function makeJourney(): JourneyFile {
  const phases: JourneyPhase[] = [
    { id: 'p1', title: 'Setup', months: '1-2', focus: '', tasks: ['t1', 't2'], warnings: ['w1'], decisions: [], mentorNotes: [], opportunities: [] },
    { id: 'p2', title: 'DSA', months: '3-5', focus: '', tasks: ['t3'], warnings: [], decisions: [], mentorNotes: [], opportunities: [] },
  ];
  return { id: 'year-1-cse', schemaVersion: '1', year: 1, branch: 'cse', title: 'Year 1', phases };
}

const cards: KBCard[] = [task('t1'), task('t2'), task('t3')];
const anti = { id: 'w1', type: 'anti-pattern' } as KBCard;
const snapshot = [...cards, anti];

describe('journey-engine', () => {
  const journey = makeJourney();
  const cardsById = buildCardsById(snapshot);

  it('defaults current phase to the first when unknown', () => {
    const student = baseStudent({ currentPhaseId: 'nope' });
    const view = getJourneyView(journey, student, cardsById);
    expect(view.currentPhaseIndex).toBe(0);
    expect(view.phases[0].status).toBe('current');
    expect(view.phases[1].status).toBe('locked');
  });

  it('marks earlier phases completed and later phases locked', () => {
    const student = baseStudent({ currentPhaseId: 'p2' });
    const view = getJourneyView(journey, student, cardsById);
    expect(view.phases[0].status).toBe('completed');
    expect(view.phases[1].status).toBe('current');
    expect(view.nextPhaseId).toBeNull();
  });

  it('resolves phase items to cards and order-preserving', () => {
    const student = baseStudent({ currentPhaseId: 'p1' });
    const view = getJourneyView(journey, student, cardsById);
    expect(view.phases[0].tasks.map((t) => t.id)).toEqual(['t1', 't2']);
    expect(view.phases[0].tasks.length).toBe(2);
  });

  it('currentPhaseTasksDone is true only when all tasks in current phase are done', () => {
    const student = baseStudent({ currentPhaseId: 'p2', completedTaskIds: ['t3'] });
    expect(currentPhaseTasksDone(journey, student)).toBe(true);

    const student2 = baseStudent({ currentPhaseId: 'p2', completedTaskIds: [] });
    expect(currentPhaseTasksDone(journey, student2)).toBe(false);
  });
});

function baseStudent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 's1',
    name: 'Test',
    degree: 'B.Tech',
    branch: 'CSE',
    year: 1,
    semester: 1,
    goals: ['placements'],
    skills: [],
    interests: [],
    weeklyHours: 10,
    learningStyle: 'visual' as const,
    concerns: [],
    completedTaskIds: [],
    savedOpportunityIds: [],
    dismissedWarningIds: [],
    journeyId: 'j-1',
    currentPhaseId: 'p1',
    lastActiveAt: '',
    ...overrides,
  };
}