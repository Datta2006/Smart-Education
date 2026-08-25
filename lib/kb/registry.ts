import { loadKB, revalidateKB as revalidateKBLoader, KBSnapshot } from './loader';
import { validateKBSnapshot, KBValidationReport } from './validate';
import { JourneyFile, KBCard } from '../../types/kb';
import { Result } from '../../types/result';

export async function getTaskById(id: string): Promise<Result<KBCard>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  const task = res.value.tasks.find((t) => t.id === id);
  return task ? { ok: true, value: task } : { ok: false, error: `Task ${id} not found` };
}

export async function getTasksByIds(ids: string[]): Promise<Result<KBCard[]>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  const tasks = res.value.tasks.filter((t) => ids.includes(t.id));
  return { ok: true, value: tasks };
}

export async function getAntiPatternById(id: string): Promise<Result<KBCard>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  const ap = res.value.antiPatterns.find((a) => a.id === id);
  return ap ? { ok: true, value: ap } : { ok: false, error: `Anti-pattern ${id} not found` };
}

export async function getDecisionGuides(): Promise<Result<KBCard[]>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, value: res.value.decisions };
}

export async function getMentorNotes(): Promise<Result<KBCard[]>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, value: res.value.mentorNotes };
}

export async function getOpportunities(): Promise<Result<KBCard[]>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, value: res.value.opportunities };
}

export async function getJourneyForSegment(journeyId: string): Promise<Result<JourneyFile>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  const journey = res.value.journeys.find((j) => j.id === journeyId);
  return journey ? { ok: true, value: journey } : { ok: false, error: 'segment-not-found' };
}

export async function getJourneyByFilename(filename: string): Promise<Result<JourneyFile>> {
  return getJourneyForSegment(filename.replace(/\.json$/, ''));
}

export async function getAllKBCards(): Promise<Result<KBSnapshot>> {
  return loadKB();
}

export async function getCardById(id: string): Promise<Result<KBCard>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  const found: KBCard | undefined = [
    ...res.value.tasks,
    ...res.value.antiPatterns,
    ...res.value.decisions,
    ...res.value.mentorNotes,
    ...res.value.opportunities,
  ].find((c) => c.id === id);
  return found ? { ok: true, value: found } : { ok: false, error: `Card ${id} not found` };
}

export async function getKBReport(): Promise<Result<KBValidationReport>> {
  const res = await loadKB();
  if (!res.ok) return { ok: false, error: res.error };
  return validateKBSnapshot(res.value);
}

export function revalidateKB() {
  revalidateKBLoader();
}