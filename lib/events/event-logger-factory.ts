import { EventLogger } from './event-logger';
import { LocalEventLogger } from './local-event-logger';
import { env } from '../config/env';

export function getEventLogger(): EventLogger {
  if (env.hasSupabase) {
    throw new Error('SupabaseEventLogger not implemented yet');
  }
  return new LocalEventLogger();
}