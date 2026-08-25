import { JourneyFile, KBCard } from './kb';
import { StudentState } from './student';

export interface JourneyPhaseView {
  id: string;
  title: string;
  months: string;
  focus: string;
  status: 'completed' | 'current' | 'locked';
  tasks: KBCard[];
  warnings: KBCard[];
  decisions: KBCard[];
  mentorNotes: KBCard[];
  opportunities: KBCard[];
}

export interface JourneyView {
  journey: JourneyFile;
  phases: JourneyPhaseView[];
  currentPhaseIndex: number;
  nextPhaseId: string | null;
}
