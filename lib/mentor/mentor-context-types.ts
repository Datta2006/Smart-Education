import { StudentState } from '../../types/student';
import { KBCard } from '../../types/kb';
import { JourneyView } from '../../types/journey';

export interface MentorContext {
  student: StudentState;
  currentPhaseTitle: string;
  completedTasks: KBCard[];
  pendingTasks: KBCard[];
  concerns: string[];
  mentorNotes: KBCard[];
  antiPatterns: KBCard[];
  decisionGuides: KBCard[];
  journeyView: JourneyView;
}