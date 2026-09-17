import type { FocusData, FocusSession, FocusStats } from "./types";

const FOCUS_KEY = "sos_focus_data";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — fail quietly */
  }
}

export function loadFocusData(): FocusData {
  return read<FocusData>(FOCUS_KEY, { sessions: [] });
}

export function saveFocusData(data: FocusData): void {
  write(FOCUS_KEY, data);
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: string): string {
  return date.slice(0, 10);
}

export function computeStreak(dates: string[]): number {
  const days = new Set(dates.map(dayKey));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // If no session today, the streak may still count from yesterday.
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  while (days.has(dayKey(cursor.toISOString()))) {
    streak++;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return streak;
}

/** Pure: derives focus statistics from the persisted session list. */
export function computeFocusStats(data: FocusData): FocusStats {
  const completed = data.sessions.filter((s) => s.completed);
  const today = new Date().toISOString().slice(0, 10);
  const totalMinutes = completed.reduce((a, s) => a + s.durationMin, 0);
  return {
    totalMinutes,
    todayMinutes: completed
      .filter((s) => dayKey(s.date) === today)
      .reduce((a, s) => a + s.durationMin, 0),
    sessionCount: completed.length,
    longestSessionMin: completed.reduce((a, s) => Math.max(a, s.durationMin), 0),
    streakDays: computeStreak(completed.map((s) => s.date)),
  };
}

export function makeFocusSession(durationMin: number, completed: boolean): FocusSession {
  return {
    id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    date: new Date().toISOString(),
    durationMin,
    completed,
  };
}
