import type { MentorContext } from '../mentor/mentor-context-types';

export interface AIProviderMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Contract for a real LLM-backed mentor adapter (Gemini/OpenAI). The app only
 * ever talks to MentorProvider; future adapters implement this and get
 * switched in within lib/config/env.ts — no other file changes.
 */
export interface AIProvider {
  readonly name: string;
  generate(messages: AIProviderMessage[], context: MentorContext): Promise<string>;
}