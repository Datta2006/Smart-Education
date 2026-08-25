import { describe, it, expect } from 'vitest';
import { validateKBSnapshot } from '../lib/kb/validate';

const task = (id: string) => ({
  id, type: 'task' as const, schemaVersion: '1', title: id, description: '', content: '',
  degree: 'btech', branch: 'cse', year: 1, goals: [], tags: [], priority: 'high' as const, status: 'published',
});

describe('validateKBSnapshot', () => {
  it('reports no errors for a healthy snapshot', () => {
    const report = validateKBSnapshot({
      tasks: [task('t1')],
      antiPatterns: [],
      decisions: [],
      mentorNotes: [],
      opportunities: [],
      journeys: [
        {
          id: 'j', schemaVersion: '1', year: 1, branch: 'cse', title: 'J',
          phases: [{ id: 'p1', title: 'P', months: '', focus: '', tasks: ['t1'], warnings: [], decisions: [], mentorNotes: [], opportunities: [] }],
        },
      ],
    });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.issues.filter((i) => i.severity === 'error')).toHaveLength(0);
      expect(report.value.totalCards).toBe(1);
    }
  });

  it('flags a journey reference to a missing card', () => {
    const report = validateKBSnapshot({
      tasks: [task('t1')],
      antiPatterns: [],
      decisions: [],
      mentorNotes: [],
      opportunities: [],
      journeys: [
        {
          id: 'j', schemaVersion: '1', year: 1, branch: 'cse', title: 'J',
          phases: [{ id: 'p1', title: 'P', months: '', focus: '', tasks: ['ghost'], warnings: [], decisions: [], mentorNotes: [], opportunities: [] }],
        },
      ],
    });
    expect(report.ok).toBe(true);
    if (report.ok) {
      const errors = report.value.issues.filter((i) => i.category === 'missing-reference');
      expect(errors.map((e) => e.message)).toContainEqual(expect.stringContaining('ghost'));
    }
  });

  it('detects duplicate ids', () => {
    const report = validateKBSnapshot({
      tasks: [task('dup')],
      antiPatterns: [task('dup')],
      decisions: [],
      mentorNotes: [],
      opportunities: [],
      journeys: [],
    });
    expect(report.ok).toBe(true);
    if (report.ok) {
      expect(report.value.issues.some((i) => i.category === 'duplicate-id')).toBe(true);
    }
  });
});