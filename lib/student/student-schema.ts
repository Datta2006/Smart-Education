import { z } from 'zod';
import { LearningStyle } from '../../types/student';

const LEARNING_STYLES: LearningStyle[] = ['visual', 'auditory', 'reading-writing', 'kinesthetic'];

export const StudentOnboardingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  degree: z.string().min(1, 'Degree is required'),
  branch: z.string().min(1, 'Branch is required'),
  year: z.coerce.number().min(1).max(5),
  semester: z.coerce.number().min(1).max(10),
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  weeklyHours: z.coerce.number().min(0).max(168),
  learningStyle: z.enum(['visual', 'auditory', 'reading-writing', 'kinesthetic']),
  concerns: z.array(z.string()).default([]),
});

export type StudentOnboardingValues = z.infer<typeof StudentOnboardingSchema>;

export const LEARNING_STYLE_OPTIONS = LEARNING_STYLES;