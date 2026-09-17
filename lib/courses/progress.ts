import { COURSE_CATALOG } from "./catalog";
import type { CourseQuestion, CourseTopic } from "./catalog";

export type CourseTrack = "dsa" | "system-design" | "sheets";

export interface CourseProgress {
  /** Completed item ids: `${track}:${itemId}` */
  completed: string[];
  updatedAt: string;
}

const KEY = "sos_course_progress_v1";

export function loadCourseProgress(): CourseProgress {
  if (typeof window === "undefined") return { completed: [], updatedAt: "" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { completed: [], updatedAt: "" };
    const parsed = JSON.parse(raw) as CourseProgress;
    if (!Array.isArray(parsed.completed)) return { completed: [], updatedAt: "" };
    return parsed;
  } catch {
    return { completed: [], updatedAt: "" };
  }
}

export function saveCourseProgress(p: CourseProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function itemKey(track: CourseTrack, itemId: string): string {
  return `${track}:${itemId}`;
}

export function isCompleted(p: CourseProgress, track: CourseTrack, itemId: string): boolean {
  return p.completed.includes(itemKey(track, itemId));
}

export function toggleItem(
  p: CourseProgress,
  track: CourseTrack,
  itemId: string
): CourseProgress {
  const key = itemKey(track, itemId);
  const completed = p.completed.includes(key)
    ? p.completed.filter((k) => k !== key)
    : [...p.completed, key];
  return { completed, updatedAt: new Date().toISOString() };
}

/** Pure helpers used by both the UI and tests. */
export function courseTotals(): { dsa: number; systemDesign: number } {
  return {
    dsa: COURSE_CATALOG.dsa.modules.reduce((a, m) => a + m.questions.length, 0),
    systemDesign: COURSE_CATALOG.systemDesign.modules.reduce(
      (a, m) => a + m.topics.length,
      0
    ),
  };
}

export function moduleStats(
  track: CourseTrack,
  moduleId: string,
  progress: CourseProgress
): { done: number; total: number; pct: number } {
  let total = 0;
  if (track === "dsa") {
    const mod = COURSE_CATALOG.dsa.modules.find((m) => m.id === moduleId);
    total = mod ? mod.questions.length : 0;
  } else if (track === "system-design") {
    const mod = COURSE_CATALOG.systemDesign.modules.find((m) => m.id === moduleId);
    total = mod ? mod.topics.length : 0;
  }
  const done = progress.completed.filter((k) =>
    k.startsWith(`${track}:${moduleId}:`)
  ).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function overallStats(progress: CourseProgress): {
  done: number;
  total: number;
  pct: number;
  byTrack: Record<CourseTrack, number>;
} {
  const totals = courseTotals();
  const doneDsa = progress.completed.filter((k) => k.startsWith("dsa:")).length;
  const doneSd = progress.completed.filter((k) => k.startsWith("system-design:")).length;
  const done = doneDsa + doneSd;
  const total = totals.dsa + totals.systemDesign;
  return {
    done,
    total,
    pct: total ? Math.round((done / total) * 100) : 0,
    byTrack: { dsa: doneDsa, "system-design": doneSd, sheets: 0 },
  };
}

export type { CourseQuestion, CourseTopic };
