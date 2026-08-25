import { MentorProvider } from './mentor-provider';
import { MockMentorProvider } from './mock-mentor-provider';
import { env } from '../config/env';
import type { AIProvider } from '../ai/ai-provider';

/**
 * Future: when a real LLM adapter exists (GeminiMentorProvider,
 * OpenAIMentorProvider), implement MentorProvider on top of AIProvider and
 * return it here based on env.aiProvider. No other file changes.
 */
export function getMentorProvider(_ai?: AIProvider): MentorProvider {
  if (env.aiProvider !== 'mock') {
    // Reserved for Supabase/AI wiring — MVP ships deterministic mock only.
  }
  return new MockMentorProvider();
}