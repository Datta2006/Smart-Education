import { describe, it, expect } from 'vitest';
import { loadKB } from '../lib/kb/loader';
import { validateKBSnapshot } from '../lib/kb/validate';

describe('KB loader (real content/kb)', () => {
  it('loads and normalizes the real KB without throwing', async () => {
    const res = await loadKB();
    expect(res.ok).toBe(true);
  });

  it('loads the expected 77 cards and 4 journeys', async () => {
    const res = await loadKB();
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const s = res.value;
    expect(s.tasks.length).toBe(29);
    expect(s.antiPatterns.length).toBe(14);
    expect(s.decisions.length).toBe(10);
    expect(s.mentorNotes.length).toBe(15);
    expect(s.opportunities.length).toBe(9);
    expect(s.journeys.length).toBe(4);
  });

  it('normalizes raw types (anti_pattern -> anti-pattern, mentor_note -> mentor-note)', async () => {
    const res = await loadKB();
    if (!res.ok) return;
    expect(res.value.antiPatterns.every((a) => a.type === 'anti-pattern')).toBe(true);
    expect(res.value.mentorNotes.every((m) => m.type === 'mentor-note')).toBe(true);
  });

  it('journey references all resolve against real KB cards (zero missing references)', async () => {
    const res = await loadKB();
    if (!res.ok) return;
    const report = validateKBSnapshot(res.value);
    if (!report.ok) return;
    const missing = report.value.issues.filter((i) => i.category === 'missing-reference');
    expect(missing).toHaveLength(0);
  });
});