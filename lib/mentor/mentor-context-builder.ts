import { StudentState } from '../../types/student';
import { KBCard } from '../../types/kb';
import { JourneyView } from '../../types/journey';
import { MentorContext } from './mentor-context-types';

export function buildMentorContext(
  studentState: StudentState,
  allCards: KBCard[],
  journeyView: JourneyView,
): MentorContext {
  const currentPhaseView = journeyView.phases[journeyView.currentPhaseIndex];

  return {
    student: studentState,
    currentPhaseTitle: currentPhaseView?.title ?? '',
    completedTasks: allCards.filter((c) => studentState.completedTaskIds.includes(c.id)),
    pendingTasks: currentPhaseView?.tasks.filter((t) => !studentState.completedTaskIds.includes(t.id)) ?? [],
    concerns: studentState.concerns,
    mentorNotes: allCards.filter((c) => c.type === 'mentor-note'),
    antiPatterns: allCards.filter((c) => c.type === 'anti-pattern'),
    decisionGuides: allCards.filter((c) => c.type === 'decision'),
    journeyView,
  };
}