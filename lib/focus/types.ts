export interface FocusSession {
  id: string;
  date: string;
  durationMin: number;
  completed: boolean;
}

export interface FocusData {
  sessions: FocusSession[];
}

export interface FocusStats {
  totalMinutes: number;
  todayMinutes: number;
  sessionCount: number;
  longestSessionMin: number;
  streakDays: number;
}
