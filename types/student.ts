export type LearningStyle = 'visual' | 'auditory' | 'reading-writing' | 'kinesthetic';

export interface AnalyticsData {
  metrics: {
    avgWpm: number;
    avgAccuracy: number;
    bestWpm: number;
    totalPracticeMinutes: number;
    streakDays: number;
  };
  charts: {
    typingStats: Array<{ date: string; value: number; label?: string }>;
    taskCompletion: Array<{ date: string; value: number; label?: string }>;
    weeklyHours: Array<{ date: string; value: number; label?: string }>;
  };
}

export interface StudentState {
  id: string;
  name: string;
  degree: string;
  branch: string;
  year: number;
  semester: number;
  goals: string[];
  skills: string[];
  interests: string[];
  weeklyHours: number;
  learningStyle: LearningStyle;
  concerns: string[];
  completedTaskIds: string[];
  savedOpportunityIds: string[];
  dismissedWarningIds: string[];
  journeyId: string;
  currentPhaseId: string;
  lastActiveAt: string; // ISO date string
  analytics?: AnalyticsData;
  resumeData?: Array<{ section: string; content: string }>;
}