import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import {
  RawTaskSchema,
  RawAntiPatternSchema,
  RawDecisionSchema,
  RawMentorNoteSchema,
  RawOpportunitySchema,
  RawJourneySchema,
  KB_SCHEMA_VERSION,
  type RawTask,
  type RawAntiPattern,
  type RawDecision,
  type RawMentorNote,
  type RawOpportunity,
  type RawJourney,
} from './schemas';

export type KBSnapshot = {
  tasks: KBCard[];
  antiPatterns: KBCard[];
  decisions: KBCard[];
  mentorNotes: KBCard[];
  opportunities: KBCard[];
  journeys: JourneyFile[];
};

let cache: KBSnapshot | null = null;

const KB_ROOT = path.join(process.cwd(), 'content/kb');

import type { JourneyFile, JourneyPhase, KBCard, KBType, CardPriority } from '../../types/kb';
import type { Result } from '../../types/result';

const TYPE_MAPPING: Record<string, KBType> = {
  task: 'task',
  anti_pattern: 'anti-pattern',
  decision: 'decision',
  mentor_note: 'mentor-note',
  opportunity: 'opportunity',
};

function deriveDescription(content: string): string {
  const lines = content.split('\n');
  const buf: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) continue;
    buf.push(line);
    if (buf.join(' ').length > 160) break;
  }
  return buf.join(' ').slice(0, 180);
}

function normalizeCard(raw: RawCard, content: string): KBCard {
  const type = TYPE_MAPPING[raw.type] ?? 'task';
  return {
    id: raw.id,
    type,
    schemaVersion: raw.schemaVersion ?? KB_SCHEMA_VERSION,
    title: raw.title,
    description: deriveDescription(content),
    content: content.trim(),
    phase: raw.phase,
    degree: raw.degree ?? '',
    branch: raw.branch ?? '',
    year: raw.year ?? 0,
    goals: raw.goals ?? [],
    tags: raw.tags ?? [],
    priority: (raw.priority as CardPriority | undefined) ?? 'medium',
    status: raw.status ?? 'draft',
    estimatedHours: (raw as RawTask).estimatedHours,
    difficulty: (raw as RawTask).difficulty,
    triggerCondition:
      raw.type === 'mentor_note' ? (raw as RawMentorNote).trigger_condition : undefined,
  };
}

const CARD_SCHEMAS = {
  tasks: RawTaskSchema,
  'anti-patterns': RawAntiPatternSchema,
  decisions: RawDecisionSchema,
  'mentor-notes': RawMentorNoteSchema,
  opportunities: RawOpportunitySchema,
};

async function loadMdFile(dirName: keyof typeof CARD_SCHEMAS): Promise<KBCard[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(path.join(KB_ROOT, dirName));
  } catch (error) {
    return [];
  }

  const schema = CARD_SCHEMAS[dirName];
  const cards: KBCard[] = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    let fileContent: string;
    try {
      fileContent = await fs.readFile(path.join(KB_ROOT, dirName, file), 'utf-8');
    } catch {
      continue;
    }
    const { data, content } = matter(fileContent);
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      console.error(`[KB] Invalid frontmatter in ${dirName}/${file}:`, parsed.error.flatten());
      continue;
    }
    cards.push(normalizeCard(parsed.data as RawCard, content));
  }
  return cards;
}

async function loadJourneys(): Promise<JourneyFile[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(path.join(KB_ROOT, 'journey'));
  } catch (error) {
    return [];
  }

  const journeys: JourneyFile[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    let fileContent: string;
    try {
      fileContent = await fs.readFile(path.join(KB_ROOT, 'journey', file), 'utf-8');
    } catch {
      continue;
    }
    let raw: unknown;
    try {
      raw = JSON.parse(fileContent);
    } catch (error) {
      console.error(`[KB] Invalid JSON in journey/${file}`);
      continue;
    }
    const parsed = RawJourneySchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`[KB] Invalid journey ${file}:`, parsed.error.flatten());
      continue;
    }
    const phases: JourneyPhase[] = parsed.data.phases.map((p) => ({
      id: p.phase_id,
      title: p.title,
      months: p.months ?? '',
      focus: p.focus ?? '',
      tasks: p.tasks ?? [],
      warnings: p.warnings ?? [],
      decisions: p.decisions ?? [],
      mentorNotes: p.mentor_notes ?? [],
      opportunities: p.opportunities ?? [],
    }));

    journeys.push({
      id: file.replace(/\.json$/, ''),
      schemaVersion: KB_SCHEMA_VERSION,
      year: parsed.data.year,
      branch: parsed.data.branch,
      title: parsed.data.title,
      phases,
    });
  }
  return journeys;
}

export async function loadKB(): Promise<Result<KBSnapshot>> {
  if (cache) return { ok: true, value: cache };

  try {
    const [tasks, antiPatterns, decisions, mentorNotes, opportunities, journeys] = await Promise.all([
      loadMdFile('tasks'),
      loadMdFile('anti-patterns'),
      loadMdFile('decisions'),
      loadMdFile('mentor-notes'),
      loadMdFile('opportunities'),
      loadJourneys(),
    ]);

    cache = { tasks, antiPatterns, decisions, mentorNotes, opportunities, journeys };
    return { ok: true, value: cache };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error while loading KB';
    return { ok: false, error: message };
  }
}

export function revalidateKB(): void {
  cache = null;
}

type RawCard = RawTask | RawAntiPattern | RawDecision | RawMentorNote | RawOpportunity;