export type Difficulty = "easy" | "medium" | "hard" | "extreme";

export interface TypingTestResult {
  id: string;
  date: string;
  difficulty: Difficulty;
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  durationMs: number;
  chars: number;
  errors: number;
}

export interface TypingSession {
  tests: TypingTestResult[];
}

export interface TypingStats {
  tests: number;
  avgWpm: number;
  maxWpm: number;
  avgAccuracy: number;
  bestAccuracy: number;
  avgConsistency: number;
  streakDays: number;
  totalChars: number;
  practiceMinutes: number;
}
