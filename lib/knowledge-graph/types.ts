/**
 * Type definitions for knowledge graph system
 */

export type ConceptLevel = 'beginner' | 'intermediate' | 'confident';
export type ConceptStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface ConceptWithStatus {
  id: string;
  title: string;
  description: string;
  level: ConceptLevel;
  status: ConceptStatus;
  masteryScore?: number;
  confidenceScore?: number;
}

