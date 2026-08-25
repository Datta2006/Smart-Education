import { Result } from '../../types/result';

export type SegmentParams = {
  degree: string;
  branch: string;
  year: number;
};

/**
 * Typed lookup table: degree/branch/year segment -> KB journey id.
 * Add a new row per segment you author a journey for. Never guess paths
 * via string concatenation.
 */
const SEGMENT_MAP: Record<string, string> = {
  'btech-cse-1': 'year-1-cse',
  'btech-cse-2': 'year-2-cse',
  'btech-cse-3': 'year-3-cse',
  'btech-cse-4': 'year-4-cse',
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function resolveSegment(params: SegmentParams): Result<string, 'segment-not-found'> {
  const key = `${slug(params.degree)}-${slug(params.branch)}-${params.year}`;

  const journeyId = SEGMENT_MAP[key];
  if (journeyId) return { ok: true, value: journeyId };

  return { ok: false, error: 'segment-not-found' };
}