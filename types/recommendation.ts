export type RecommendationActionType = 'task' | 'opportunity' | 'warning' | 'mentor-note';

export interface Recommendation {
  id: string;
  title: string;
  reason: string;
  sourceKBIds: string[];
  actionType: RecommendationActionType;
  estimatedTime: string;
  priorityScore: number;
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  generatedAt: string;
}
