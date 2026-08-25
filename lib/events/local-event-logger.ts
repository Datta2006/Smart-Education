import { EventLogger, EventLog, EventType } from './event-logger';

const STORAGE_KEY = 'sos_events';

export class LocalEventLogger implements EventLogger {
  async logEvent(type: EventType, metadata?: Record<string, any>): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const events = await this.getEventsInternal();
      const newEvent: EventLog = {
        type,
        timestamp: new Date().toISOString(),
        metadata,
      };
      events.push(newEvent);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to log event', e);
    }
  }

  async getEvents(): Promise<EventLog[]> {
    return this.getEventsInternal();
  }

  async clearEvents(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }

  private async getEventsInternal(): Promise<EventLog[]> {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
}
