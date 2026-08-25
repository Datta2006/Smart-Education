import { StudentState } from '../../types/student';
import { KBCard } from '../../types/kb';
import type { KBSnapshot } from '../kb/loader';
import { Recommendation, RecommendationResult } from '../../types/recommendation';
import { getJourneyView, buildCardsById } from '../journey/journey-engine';
import { calculateRecommendationScore, detectAntiPatternTriggers } from './scoring';

export type RecommendationEngineInput = {
  snapshot: KBSnapshot;
  studentState: StudentState;
};

function estimatedHours(hours?: number): string {
  if (!hours || hours <= 0) return 'Varies';
  return `${hours}h`;
}

function taskReason(task: KBCard, phaseTitle: string, phaseFocus: string): string {
  const focus = phaseFocus ? ` (${phaseFocus})` : '';
  return `Your current phase is "${phaseTitle}${focus}". Starting "${task.title}" is a high-leverage next step for a Year ${taskYear(task)} CSE student.`;
}

function taskYear(task: KBCard): number {
  return task.year || 1;
}

/**
 * Deterministic recommendation engine. Pure function of
 * (KB snapshot + student state) -> RecommendationResult.
 */
export function generateRecommendations(input: RecommendationEngineInput): RecommendationResult {
  const { snapshot, studentState } = input;
  const cardsById = buildCardsById([
    ...snapshot.tasks,
    ...snapshot.antiPatterns,
    ...snapshot.decisions,
    ...snapshot.mentorNotes,
    ...snapshot.opportunities,
  ]);

  const journey = snapshot.journeys.find((j) => j.id === studentState.journeyId);
  const recommendations: Recommendation[] = [];

  if (journey) {
    const view = getJourneyView(journey, studentState, cardsById);
    const phase = view.phases[view.currentPhaseIndex];

    // Undone current-phase tasks
    for (const task of phase.tasks) {
      if (studentState.completedTaskIds.includes(task.id)) continue;

      const inJourney = phase.tasks.some((t) => t.id === task.id);
      const matchesGoal = task.goals.some((g) => studentState.goals.includes(g));
      const matchesConcern = studentState.concerns.some((c) => {
        const norm = c.toLowerCase();
        return [task.title.toLowerCase(), task.goals.join(' ').toLowerCase()].some((s) =>
          s.includes(norm) || norm.includes(s),
        );
      });
      const hoursSuffice = (task.estimatedHours ?? 0) <= studentState.weeklyHours * 4;

      const score = calculateRecommendationScore({
        inCurrentPhase: true,
        inJourney,
        matchesGoal,
        matchesConcern,
        hoursSuffice,
      });

      recommendations.push({
        id: `task-${task.id}`,
        title: task.title,
        reason: taskReason(task, phase.title, phase.focus),
        sourceKBIds: [task.id],
        actionType: 'task',
        estimatedTime: estimatedHours(task.estimatedHours),
        priorityScore: score,
      });
    }

    // Triggered anti-patterns
    const triggered = detectAntiPatternTriggers(studentState, snapshot.antiPatterns);
    for (const ap of triggered) {
      if (studentState.dismissedWarningIds.includes(ap.id)) continue;
      recommendations.push({
        id: `warning-${ap.id}`,
        title: `Avoid: ${ap.title}`,
        reason: ap.description || `Your profile matches the "${ap.title}" pattern. Progress is a better currency than certificates.`,
        sourceKBIds: [ap.id],
        actionType: 'warning',
        estimatedTime: '0h',
        priorityScore: 1,
      });
    }

    // Current-phase opportunities
    for (const opp of phase.opportunities) {
      if (studentState.savedOpportunityIds.includes(opp.id)) continue;
      const score = calculateRecommendationScore({
        inCurrentPhase: true,
        inJourney: false,
        matchesGoal: opp.goals.some((g) => studentState.goals.includes(g)),
        matchesConcern: false,
        hoursSuffice: true,
      });
      recommendations.push({
        id: `opportunity-${opp.id}`,
        title: opp.title,
        reason: `This opportunity fits your current phase "${phase.title}". ${opp.description}`,
        sourceKBIds: [opp.id],
        actionType: 'opportunity',
        estimatedTime: 'Varies',
        priorityScore: score,
      });
    }
  } else {
    // No journey for this segment -> curated-soon state is handled by UI.
  }

  // Method: sort stable — warnings last unless top-scored
  recommendations.sort(
    (a, b) =>
      b.priorityScore - a.priorityScore ||
      Number(a.actionType === 'warning') - Number(b.actionType === 'warning'),
  );

  return {
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}