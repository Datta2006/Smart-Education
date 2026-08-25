export type KBType =
  | 'task'
  | 'anti-pattern'
  | 'decision'
  | 'mentor-note'
  | 'opportunity';

export type CardPriority = 'high' | 'medium' | 'low';

/**
 * Normalized KB card. The raw frontmatter from content/kb is parsed and
 * normalized into this shape by lib/kb/loader.ts. UI and engines only ever
 * see this normalized shape.
 */
export interface KBCard {
  id: string;
  type: KBType;
  schemaVersion: string;
  title: string;
  /** Short human-readable summary, derived from frontmatter/first heading. */
  description: string;
  /** Full markdown body of the card. */
  content: string;
  /** Raw phase tag from frontmatter, e.g. "month-1". */
  phase?: string;
  degree: string;
  branch: string;
  year: number;
  goals: string[];
  tags: string[];
  priority: CardPriority;
  status: string;
  /** Task-only. */
  estimatedHours?: number;
  difficulty?: string;
  /** Mentor-note-only. */
  triggerCondition?: string;
}

export interface JourneyPhase {
  id: string;
  title: string;
  months: string;
  focus: string;
  tasks: string[];
  warnings: string[];
  decisions: string[];
  mentorNotes: string[];
  opportunities: string[];
}

export interface JourneyFile {
  id: string;
  schemaVersion: string;
  year: number;
  branch: string;
  title: string;
  phases: JourneyPhase[];
}
