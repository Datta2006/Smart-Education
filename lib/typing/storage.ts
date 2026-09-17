import type { TypingSession, TypingStats } from "./types";

const TYPING_KEY = "sos_typing_data";

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

export function loadTypingSession(): TypingSession {
  return read<TypingSession>(TYPING_KEY, { tests: [] });
}

export function saveTypingSession(session: TypingSession): void {
  write(TYPING_KEY, session);
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
  // If not practiced today, streak may still count from yesterday.
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  while (days.has(dayKey(cursor.toISOString()))) {
    streak++;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export function computeStats(session: TypingSession): TypingStats {
  const { tests } = session;
  if (tests.length === 0) {
    return {
      tests: 0,
      avgWpm: 0,
      maxWpm: 0,
      avgAccuracy: 0,
      bestAccuracy: 0,
      avgConsistency: 0,
      streakDays: 0,
      totalChars: 0,
      practiceMinutes: 0,
    };
  }
  const sum = (fn: (t: (typeof tests)[number]) => number) =>
    tests.reduce((a, t) => a + fn(t), 0);
  return {
    tests: tests.length,
    avgWpm: Math.round(sum((t) => t.wpm) / tests.length),
    maxWpm: Math.max(...tests.map((t) => t.wpm)),
    avgAccuracy: Math.round((sum((t) => t.accuracy) / tests.length) * 10) / 10,
    bestAccuracy: Math.max(...tests.map((t) => t.accuracy)),
    avgConsistency: Math.round(sum((t) => t.consistency) / tests.length),
    streakDays: computeStreak(tests.map((t) => t.date)),
    totalChars: sum((t) => t.chars),
    practiceMinutes: Math.round((sum((t) => t.durationMs) / 60000) * 10) / 10,
  };
}

export function dailyWpmSeries(
  session: TypingSession
): Array<{ date: string; value: number; label: string }> {
  const byDay = new Map<string, number[]>();
  for (const t of testsInLastNDays(session, 14)) {
    const key = dayKey(t.date);
    const arr = byDay.get(key) ?? [];
    arr.push(t.wpm);
    byDay.set(key, arr);
  }
  const out: Array<{ date: string; value: number; label: string }> = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(cursor.getTime() - i * DAY_MS);
    const key = d.toISOString().slice(0, 10);
    const vals = byDay.get(key);
    out.push({
      date: key,
      value: vals ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return out;
}

export function difficultyBreakdown(session: TypingSession) {
  const counts = { easy: 0, medium: 0, hard: 0, extreme: 0 } as Record<string, number>;
  const avgWpm = { easy: 0, medium: 0, hard: 0, extreme: 0 } as Record<string, number>;
  for (const t of session.tests) {
    counts[t.difficulty] = (counts[t.difficulty] ?? 0) + 1;
    avgWpm[t.difficulty] = (avgWpm[t.difficulty] ?? 0) + t.wpm;
  }
  const list = Object.entries(counts).map(([d, count]) => ({
    difficulty: d,
    count,
    avgWpm: count ? Math.round(avgWpm[d] / count) : 0,
  }));
  return list.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
}

function testsInLastNDays(session: TypingSession, n: number) {
  const cutoff = new Date(Date.now() - n * DAY_MS).toISOString();
  return session.tests.filter((t) => t.date >= cutoff);
}
