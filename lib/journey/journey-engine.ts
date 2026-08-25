import { JourneyFile, KBCard } from '../../types/kb';
import { StudentState } from '../../types/student';
import { JourneyView, JourneyPhaseView } from '../../types/journey';

export type JourneyEngineDeps = {
  cardsById: Map<string, KBCard>;
};

/**
 * Pure journey engine. Given a journey file, the student state and a card
 * lookup, resolves each phase's items and marks phases as
 * completed / current / locked. No I/O — trivially unit-testable.
 */
export function getJourneyView(
  journey: JourneyFile,
  studentState: StudentState,
  cardsById: Map<string, KBCard>,
): JourneyView {
  let currentIndex = journey.phases.findIndex((p) => p.id === studentState.currentPhaseId);
  if (currentIndex === -1) currentIndex = 0;

  const resolve = (ids: string[]) =>
    ids
      .map((id) => cardsById.get(id))
      .filter((c): c is KBCard => !!c);

  const phases: JourneyPhaseView[] = journey.phases.map((phase, index) => {
    const status: JourneyPhaseView['status'] =
      index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'locked';

    const allTasks = resolve(phase.tasks);

    return {
      id: phase.id,
      title: phase.title,
      months: phase.months,
      focus: phase.focus,
      status,
      tasks: allTasks,
      warnings: resolve(phase.warnings),
      decisions: resolve(phase.decisions),
      mentorNotes: resolve(phase.mentorNotes),
      opportunities: resolve(phase.opportunities),
    };
  });

  return {
    journey,
    phases,
    currentPhaseIndex: currentIndex,
    nextPhaseId: phases[currentIndex + 1]?.id ?? null,
  };
}

export function currentPhaseTasksDone(
  journey: JourneyFile,
  studentState: StudentState,
): boolean {
  const current = journey.phases.find((p) => p.id === studentState.currentPhaseId);
  if (!current) return false;
  return current.tasks.every((id) => studentState.completedTaskIds.includes(id));
}

export function buildCardsById(allCards: KBCard[]): Map<string, KBCard> {
  return new Map(allCards.map((c) => [c.id, c]));
}