import { MentorProvider, MentorResponse } from './mentor-provider';
import { MentorContext } from './mentor-context-types';

/**
 * Deterministic, KB-grounded mentor. It only answers using content that
 * exists in the Knowledge Base — it never invents advice. Swappable for
 * GeminiMentorProvider / OpenAIMentorProvider later via lib/config/env.
 */
export class MockMentorProvider implements MentorProvider {
  async ask(question: string, context: MentorContext): Promise<MentorResponse> {
    const q = question.toLowerCase();

    if (q.includes('what should i do') || q.includes('what to do') || q.includes('focus')) {
      if (context.pendingTasks.length > 0) {
        const task = context.pendingTasks[0];
        return {
          message: `Today, focus on "${task.title}" (${task.estimatedHours}${task.estimatedHours ? 'h' : ''} window). ${task.description}`,
        };
      }
      return {
        message: `You've completed every task in your current phase ("${context.currentPhaseTitle}"). Next: pick your top pending goal from ${context.student.goals.join(', ') || 'your profile'} and explore the opportunities in this phase.`,
      };
    }

    if (q.includes('behind') || q.includes('late') || q.includes('behind?')) {
      const note = context.mentorNotes.find((n) => n.id === 'feeling-behind-in-year-1');
      if (note) return { message: note.description };
      return {
        message: `It's normal to feel behind in Year ${context.student.year}. The mentor note I have on this says: consistency beats early starts. Keep your grades solid and keep shipping small work.`,
      };
    }

    if (q.includes('cgpa')) {
      const decision = context.decisionGuides.find((d) => d.id === 'cgpa-vs-projects-year-1');
      const note = context.mentorNotes.find((n) => n.id === 'cgpa-and-college-reality');
      const msg = decision?.description || note?.description;
      if (msg) return { message: msg };
      return { message: 'I do not have a CGPA-specific guide in the KB yet.' };
    }

    if (q.includes('join') && q.includes('club')) {
      const task = context.pendingTasks.find((t) => t.id === 'survive-club-recruitment-oop');
      if (task) return { message: `Yes — and here's how: ${task.description}` };
      return { message: 'That decision depends on your year. In this journey, clubs are covered in the later phases.' };
    }

    if (q.includes('tutorial hell') || q.includes('tutorial')) {
      const ap = context.antiPatterns.find((a) => a.id === 'tutorial-hell-no-projects');
      if (ap) return { message: ap.description };
      return { message: "I don't have a card for tutorial hell yet." };
    }

    if (q.includes('hackathon')) {
      const task = context.pendingTasks.find((t) => t.id === 'first-hackathon-experience');
      if (task) return { message: task.description };
      return { message: 'Hackathons are a phase-3 item in your journey; that phase is not active yet.' };
    }

    const note = context.mentorNotes.find((n) => n.id === 'feeling-behind-in-year-1');
    return {
      message:
        note?.description ||
        `I'm your digital mentor for phase "${context.currentPhaseTitle}". ` +
          `You have ${context.pendingTasks.length} open tasks — tell me what you'd like help prioritizing.`,
    };
  }
}