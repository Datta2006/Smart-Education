import { describe, it, expect } from 'vitest';
import { resolveSegment } from '../lib/journey/segment-resolver';

describe('segment-resolver', () => {
  it('resolves a supported segment to its journey id', () => {
    const res = resolveSegment({ degree: 'B.Tech', branch: 'CSE', year: 1 });
    expect(res).toEqual({ ok: true, value: 'year-1-cse' });
  });

  it('is case/whitespace insensitive', () => {
    const res = resolveSegment({ degree: ' btech ', branch: 'cse', year: 1 });
    expect(res.ok && res.value).toBe('year-1-cse');
  });

  it('returns segment-not-found for unsupported segments instead of throwing', () => {
    const res = resolveSegment({ degree: 'B.Tech', branch: 'ECE', year: 2 });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('segment-not-found');
    }
  });

  it('resolves all four CSE years to their journeys', () => {
    expect(resolveSegment({ degree: 'B.Tech', branch: 'CSE', year: 1 })).toEqual({
      ok: true,
      value: 'year-1-cse',
    });
    expect(resolveSegment({ degree: 'B.Tech', branch: 'CSE', year: 2 })).toEqual({
      ok: true,
      value: 'year-2-cse',
    });
    expect(resolveSegment({ degree: 'B.Tech', branch: 'CSE', year: 3 })).toEqual({
      ok: true,
      value: 'year-3-cse',
    });
    expect(resolveSegment({ degree: 'B.Tech', branch: 'CSE', year: 4 })).toEqual({
      ok: true,
      value: 'year-4-cse',
    });
  });
});