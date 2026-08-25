import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import {
  RawTaskSchema,
  RawAntiPatternSchema,
  RawDecisionSchema,
  RawMentorNoteSchema,
  RawOpportunitySchema,
  RawJourneySchema,
} from '../lib/kb/schemas';

const KB_ROOT = path.join(process.cwd(), 'kb/cards');
const TYPES: Record<string, { dir: string; schema: { safeParse: (raw: unknown) => { success: boolean } } }> = {
  task: { dir: 'tasks', schema: RawTaskSchema },
  anti_pattern: { dir: 'anti-patterns', schema: RawAntiPatternSchema },
  decision: { dir: 'decisions', schema: RawDecisionSchema },
  mentor_note: { dir: 'mentor-notes', schema: RawMentorNoteSchema },
  opportunity: { dir: 'opportunities', schema: RawOpportunitySchema },
};

function loadCards() {
  const cards: { file: string; id: string; type: string; raw: unknown }[] = [];
  for (const { dir } of Object.values(TYPES)) {
    for (const file of fs.readdirSync(path.join(KB_ROOT, dir))) {
      if (!file.endsWith('.md')) continue;
      const { data } = matter(fs.readFileSync(path.join(KB_ROOT, dir, file), 'utf-8'));
      cards.push({ file: `${dir}/${file}`, id: (data as { id?: string }).id ?? '', type: (data as { type?: string }).type ?? '', raw: data });
    }
  }
  return cards;
}

describe('kb/cards (interview-prep knowledge base)', () => {
  const cards = loadCards();

  it('has the expected card count (22)', () => {
    expect(cards.length).toBe(22);
  });

  it('every card validates against its type schema and has a unique id', () => {
    const ids = new Set<string>();
    for (const card of cards) {
      const entry = TYPES[card.type];
      expect(entry, `${card.file} has an unknown type "${card.type}"`).toBeDefined();
      expect(entry.schema.safeParse(card.raw).success, `${card.file} has invalid frontmatter`).toBe(true);
      expect(ids.has(card.id), `duplicate card id "${card.id}"`).toBe(false);
      ids.add(card.id);
    }
    expect(ids.size).toBe(22);
  });

  it('every file id matches its filename', () => {
    for (const card of cards) {
      const filename = card.file.split('/').pop()!.replace(/\.md$/, '');
      expect(card.id).toBe(filename);
    }
  });

  it('mentor notes define a trigger_condition', () => {
    for (const card of cards.filter((c) => c.type === 'mentor_note')) {
      expect((card.raw as { trigger_condition?: string }).trigger_condition,
        `${card.file} must define trigger_condition`).toBeTruthy();
    }
  });

  it('task cards define estimatedHours and difficulty', () => {
    for (const card of cards.filter((c) => c.type === 'task')) {
      const raw = card.raw as { estimatedHours?: number; difficulty?: string };
      expect(raw.estimatedHours, `${card.file} must define estimatedHours`).toBeGreaterThan(0);
      expect(raw.difficulty, `${card.file} must define difficulty`).toBeTruthy();
    }
  });

  it('seed-kb-cards.sql mirrors the markdown cards (id/type/content_source)', () => {
    const seed = fs.readFileSync(path.join(process.cwd(), 'kb/sql/seed-kb-cards.sql'), 'utf-8');
    const rowRe = /^\s+\('([a-z0-9-]+)', '(\w+)', '[^']*',\s*'kb\/cards\/([^']+)'/gm;
    const rows = [...seed.matchAll(rowRe)];
    expect(rows.length).toBe(22);
    for (const [, id, type, contentSource] of rows) {
      const card = cards.find((c) => c.id === id);
      expect(card, `seed references unknown card "${id}"`).toBeDefined();
      if (!card) continue;
      expect(card.type, `type mismatch for "${id}" in seed`).toBe(type);
      expect(contentSource, `content_source mismatch for "${id}"`).toBe(`${TYPES[card.type].dir}/${id}.md`);
      expect(fs.existsSync(path.join(KB_ROOT, contentSource)), `missing markdown source ${contentSource}`).toBe(true);
    }
  });

  it('journey JSON is valid and references only existing cards', () => {
    const journeyPath = path.join(KB_ROOT, 'journey/year-3-cse.json');
    const raw = JSON.parse(fs.readFileSync(journeyPath, 'utf-8'));
    const parsed = RawJourneySchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const ids = new Set(cards.map((c) => c.id));
    for (const phase of parsed.data.phases) {
      for (const ref of [...phase.tasks, ...phase.warnings, ...phase.decisions, ...phase.mentor_notes, ...phase.opportunities]) {
        expect(ids.has(ref), `journey references unknown card "${ref}"`).toBe(true);
      }
    }
  });
});
