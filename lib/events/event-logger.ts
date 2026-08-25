export type EventType = 
  | 'onboarding_completed'
  | 'dashboard_viewed'
  | 'task_opened'
  | 'task_completed'
  | 'task_skipped'
  | 'opportunity_viewed'
  | 'opportunity_saved'
  | 'mentor_message_sent'
  | 'warning_dismissed'
  | 'weekly_review_viewed';

export interface EventLog {
  type: EventType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EventLogger {
  logEvent(type: EventType, metadata?: Record<string, any>): Promise<void>;
  getEvents(): Promise<EventLog[]>;
  clearEvents(): Promise<void>;
}
