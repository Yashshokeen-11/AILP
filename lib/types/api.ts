/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
}

export interface RoadmapResponse {
  roadmap: RoadmapConcept[];
  progress: {
    completed: number;
    total: number;
    percent: number;
  };
}

export interface RoadmapConcept {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'confident';
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  masteryScore: number;
  confidenceScore: number;
}

export interface LearningContentResponse {
  concept: {
    id: string;
    title: string;
    description: string;
    level: string;
  };
  content: {
    title: string;
    sections: Array<{
      type: 'introduction' | 'concept' | 'checkpoint' | 'analogy' | 'reflection';
      content?: string;
      question?: string;
      hint?: string;
    }>;
  };
  sessionId: string;
}

export interface AssessmentAnalysis {
  detectedWeaknesses: string[];
  startingConcept?: string;
  confidence: number;
}

export interface AssessmentResponse {
  success: boolean;
  analysis: AssessmentAnalysis;
  startingConcept: string;
}

export interface CheckpointResponse {
  success: boolean;
  feedback: string;
}

export interface CompleteConceptResponse {
  success: boolean;
  nextConcepts: string[];
}

