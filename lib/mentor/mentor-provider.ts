import { Recommendation } from '../../types/recommendation';

export interface MentorResponse {
  message: string;
  suggestions?: Recommendation[];
}

export interface MentorProvider {
  ask(question: string, context: any): Promise<MentorResponse>;
}
