import { KBCard, JourneyFile, KBType } from '../../types/kb';
import { Result } from '../../types/result';

export type KBIssue = {
  severity: 'error' | 'warning';
  category:
    | 'missing-reference'
    | 'missing-frontmatter'
    | 'duplicate-id'
    | 'type-mismatch'
    | 'card-not-in-journey'
    | 'unknown-type';
  message: string;
  cardId?: string;
};

export interface KBValidationReport {
  totalCards: number;
  counts: Record<string, number>;
  issues: KBIssue[];
}

/**
 * Cross-reference + integrity checks over the KB snapshot. Pure function of
 * the snapshot, so it is trivially unit-testable.
 */
export function validateKBSnapshot(snapshot: {
  tasks: KBCard[];
  antiPatterns: KBCard[];
  decisions: KBCard[];
  mentorNotes: KBCard[];
  opportunities: KBCard[];
  journeys: JourneyFile[];
}): Result<KBValidationReport, 'invalid-snapshot'> {
  const allCards: KBCard[] = [
    ...snapshot.tasks,
    ...snapshot.antiPatterns,
    ...snapshot.decisions,
    ...snapshot.mentorNotes,
    ...snapshot.opportunities,
  ];

  const issues: KBIssue[] = [];
  const ids = new Set<string>();

  for (const card of allCards) {
    if (!card.id) continue;
    if (ids.has(card.id)) {
      issues.push({
        severity: 'error',
        category: 'duplicate-id',
        message: `Duplicate card id "${card.id}" across KB files.`,
        cardId: card.id,
      });
    }
    ids.add(card.id);
  }

  for (const card of allCards) {
    if (!card.id || !card.title || !card.type) {
      issues.push({
        severity: 'error',
        category: 'missing-frontmatter',
        message: `A card is missing required frontmatter (id/title/type).`,
        cardId: card?.id,
      });
    }
  }

  const cardById = (id: string) => allCards.find((c) => c.id === id);

  for (const journey of snapshot.journeys) {
    for (const phase of journey.phases) {
      const refs: { key: string; expectedType: KBType; list: string[] }[] = [
        { key: 'task', expectedType: 'task', list: phase.tasks },
        { key: 'warning', expectedType: 'anti-pattern', list: phase.warnings },
        { key: 'decision', expectedType: 'decision', list: phase.decisions },
        { key: 'mentor-note', expectedType: 'mentor-note', list: phase.mentorNotes },
        { key: 'opportunity', expectedType: 'opportunity', list: phase.opportunities },
      ];
      for (const { key, expectedType, list } of refs) {
        for (const id of list) {
          const target = cardById(id);
          if (!target) {
            issues.push({
              severity: 'error',
              category: 'missing-reference',
              message: `Phase "${phase.title}" (journey ${journey.id}) references ${key} "${id}" which does not exist in the KB.`,
              cardId: `journey:${journey.id}/phase:${phase.id}`,
            });
          } else if (target.type !== expectedType) {
            issues.push({
              severity: 'warning',
              category: 'type-mismatch',
              message: `Journey ${journey.id} lists "${id}" as ${key}, but the card is type "${target.type}".`,
              cardId: id,
            });
          }
        }
      }
    }
  }

  const referenced = new Set<string>();
  for (const journey of snapshot.journeys) {
    for (const phase of journey.phases) {
      for (const list of [
        phase.tasks,
        phase.warnings,
        phase.decisions,
        phase.mentorNotes,
        phase.opportunities,
      ]) {
        list.forEach((id) => referenced.add(id));
      }
    }
  }
  for (const card of allCards) {
    if (!referenced.has(card.id)) {
      issues.push({
        severity: 'warning',
        category: 'card-not-in-journey',
        message: `Card "${card.id}" is not referenced by any journey.`,
        cardId: card.id,
      });
    }
  }

  const counts: Record<string, number> = {
    tasks: snapshot.tasks.length,
    'anti-patterns': snapshot.antiPatterns.length,
    decisions: snapshot.decisions.length,
    'mentor-notes': snapshot.mentorNotes.length,
    opportunities: snapshot.opportunities.length,
    journeys: snapshot.journeys.length,
  };

  return {
    ok: true,
    value: {
      totalCards: allCards.length,
      counts,
      issues,
    },
  };
}