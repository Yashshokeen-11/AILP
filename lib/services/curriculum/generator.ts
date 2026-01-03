/**
 * Curriculum Generator
 * 
 * Generates a personalized learning roadmap based on:
 * 1. Assessment results (confidence scores)
 * 2. Knowledge graph prerequisites
 * 3. Learner's current progress
 * 
 * This determines which concepts are available and in what order.
 */

import { PYTHON_KNOWLEDGE_GRAPH, getAvailableConcepts, getConceptById } from '@/lib/knowledge-graph/python-graph';
import { ConceptConfidence } from '../assessment/analyzer';
import { ConceptStatus } from '@/lib/knowledge-graph/types';

export interface ConceptWithStatus {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'confident';
  status: ConceptStatus;
  masteryScore: number;
  confidenceScore: number;
}

export interface PersonalizedRoadmap {
  concepts: ConceptWithStatus[];
  overallProgress: number;
  nextRecommendedConcept: string | null;
}

/**
 * Generate personalized roadmap from assessment analysis
 */
export function generateRoadmap(
  conceptConfidence: ConceptConfidence,
  completedConceptIds: string[] = []
): PersonalizedRoadmap {
  const concepts: ConceptWithStatus[] = [];
  
  // Determine status for each concept
  for (const concept of PYTHON_KNOWLEDGE_GRAPH) {
    const confidence = conceptConfidence[concept.id] || 0;
    const mastery = confidence * 0.7; // Initial mastery from confidence
    
    let status: ConceptStatus;
    
    if (completedConceptIds.includes(concept.id)) {
      status = 'completed';
    } else if (canUnlock(concept.id, completedConceptIds, conceptConfidence)) {
      // Check if currently in progress (has some confidence but not completed)
      if (confidence > 0.3 && !completedConceptIds.includes(concept.id)) {
        status = 'in_progress';
      } else {
        status = 'available';
      }
    } else {
      status = 'locked';
    }
    
    concepts.push({
      id: concept.id,
      title: concept.title,
      description: concept.description,
      level: concept.level,
      status,
      masteryScore: mastery,
      confidenceScore: confidence,
    });
  }
  
  // Calculate overall progress
  const completedCount = concepts.filter(c => c.status === 'completed').length;
  const overallProgress = (completedCount / concepts.length) * 100;
  
  // Find next recommended concept
  const nextConcept = concepts.find(c => 
    c.status === 'available' || c.status === 'in_progress'
  );
  
  return {
    concepts,
    overallProgress,
    nextRecommendedConcept: nextConcept?.id || null,
  };
}

/**
 * Check if a concept can be unlocked
 * Considers both prerequisites AND confidence thresholds
 */
function canUnlock(
  conceptId: string,
  completedConceptIds: string[],
  conceptConfidence: ConceptConfidence
): boolean {
  const concept = getConceptById(conceptId);
  if (!concept) return false;
  
  // Check prerequisites
  const prerequisitesMet = concept.prerequisites.every(prereq => 
    completedConceptIds.includes(prereq) || 
    (conceptConfidence[prereq] || 0) > 0.7 // High confidence counts as "completed"
  );
  
  if (!prerequisitesMet) return false;
  
  // Additional check: if learner has very low confidence in prerequisites,
  // don't unlock yet (they need remediation)
  const lowConfidencePrereqs = concept.prerequisites.filter(prereq => 
    (conceptConfidence[prereq] || 0) < 0.3
  );
  
  return lowConfidencePrereqs.length === 0;
}

/**
 * Update roadmap after completing a concept
 */
export function updateRoadmapAfterCompletion(
  roadmap: PersonalizedRoadmap,
  completedConceptId: string,
  finalMastery: number,
  finalConfidence: number
): PersonalizedRoadmap {
  const updatedConcepts = roadmap.concepts.map(c => {
    if (c.id === completedConceptId) {
      return {
        ...c,
        status: 'completed' as ConceptStatus,
        masteryScore: finalMastery,
        confidenceScore: finalConfidence,
      };
    }
    
    // Unlock concepts that now have prerequisites met
    if (c.status === 'locked') {
      const concept = getConceptById(c.id);
      if (concept && canUnlock(c.id, [...roadmap.concepts.filter(cc => cc.status === 'completed').map(cc => cc.id), completedConceptId], {})) {
        return { ...c, status: 'available' as ConceptStatus };
      }
    }
    
    return c;
  });
  
  const completedCount = updatedConcepts.filter(c => c.status === 'completed').length;
  const overallProgress = (completedCount / updatedConcepts.length) * 100;
  
  const nextConcept = updatedConcepts.find(c => 
    c.status === 'available' || c.status === 'in_progress'
  );
  
  return {
    concepts: updatedConcepts,
    overallProgress,
    nextRecommendedConcept: nextConcept?.id || null,
  };
}

