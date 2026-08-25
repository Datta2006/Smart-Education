import { z } from 'zod';

/**
 * Current schema version of normalized KB cards. When the normalization
 * shape changes (a breaking format change), bump this value so migratable
 * logic and /admin/kb can detect it.
 */
export const KB_SCHEMA_VERSION = '1';

/**
 * Zod schemas for the RAW KB frontmatter as authoring currently stands
 * (content/kb is the single source of truth — we validate it, never
 * rewrite it). All raw schemas are deliberately lenient: they capture the
 * fields authors actually write and tolerate optional extras so future
 * authoring changes surface as validation warnings, not crashes.
 */

const RawBaseFields = {
  id: z.string().min(1),
  type: z.string(),
  title: z.string().min(1),
  degree: z.string().optional(),
  branch: z.string().optional(),
  year: z.coerce.number().optional(),
  phase: z.string().optional(),
  goals: z.array(z.string()).default([]),
  priority: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  schemaVersion: z.string().optional(),
};

export const RawTaskSchema = z.object({
  ...RawBaseFields,
  type: z.literal('task'),
  estimatedHours: z.coerce.number().optional(),
  difficulty: z.string().optional(),
});

export const RawAntiPatternSchema = z.object({
  ...RawBaseFields,
  type: z.literal('anti_pattern'),
});

export const RawDecisionSchema = z.object({
  ...RawBaseFields,
  type: z.literal('decision'),
});

export const RawMentorNoteSchema = z.object({
  ...RawBaseFields,
  type: z.literal('mentor_note'),
  trigger_condition: z.string().optional(),
});

export const RawOpportunitySchema = z.object({
  ...RawBaseFields,
  type: z.literal('opportunity'),
});

export const RawJourneySchema = z.object({
  year: z.coerce.number(),
  branch: z.string(),
  title: z.string(),
  phases: z.array(
    z.object({
      phase_id: z.string(),
      title: z.string(),
      months: z.string().optional(),
      focus: z.string().optional(),
      tasks: z.array(z.string()).default([]),
      warnings: z.array(z.string()).default([]),
      decisions: z.array(z.string()).default([]),
      mentor_notes: z.array(z.string()).default([]),
      opportunities: z.array(z.string()).default([]),
    }),
  ),
});

export type RawTask = z.infer<typeof RawTaskSchema>;
export type RawAntiPattern = z.infer<typeof RawAntiPatternSchema>;
export type RawDecision = z.infer<typeof RawDecisionSchema>;
export type RawMentorNote = z.infer<typeof RawMentorNoteSchema>;
export type RawOpportunity = z.infer<typeof RawOpportunitySchema>;
export type RawJourney = z.infer<typeof RawJourneySchema>;
export type RawJourneyPhase = RawJourney['phases'][number];