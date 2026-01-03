/**
 * Teaching Strategy Controller
 * 
 * This is the CORE of the teaching system. It decides HOW to teach each concept.
 * 
 * KEY PRINCIPLE: LLMs generate content, but THIS controller decides:
 * - What teaching method to use (explanation, analogy, question, example)
 * - When to insert checkpoints
 * - How to structure the lesson
 * - When to adapt based on learner responses
 * 
 * This separates teaching LOGIC from content GENERATION.
 */

import { getConceptById } from '@/lib/knowledge-graph/python-graph';

export type TeachingStrategy = 'explanation' | 'analogy' | 'question' | 'example';
export type SectionType = 'introduction' | 'concept' | 'checkpoint' | 'analogy' | 'reflection';

export interface TeachingSection {
  type: SectionType;
  strategy?: TeachingStrategy; // For concept sections
  order: number;
  checkpointIndex?: number; // If type is checkpoint
}

export interface LessonPlan {
  conceptId: string;
  sections: TeachingSection[];
  estimatedTime: number;
}

/**
 * Generate lesson plan for a concept
 * This is where the teaching strategy is decided
 */
export function generateLessonPlan(
  conceptId: string,
  learnerMastery: number = 0,
  learnerConfidence: number = 0
): LessonPlan {
  const concept = getConceptById(conceptId);
  if (!concept) {
    throw new Error(`Concept not found: ${conceptId}`);
  }

  const sections: TeachingSection[] = [];
  let sectionOrder = 0;

  // Always start with introduction
  sections.push({
    type: 'introduction',
    order: sectionOrder++,
  });

  // Determine teaching approach based on concept difficulty and learner state
  const teachingStrategies = determineTeachingStrategies(concept, learnerMastery, learnerConfidence);

  // Add concept sections with different strategies
  for (let i = 0; i < teachingStrategies.length; i++) {
    const strategy = teachingStrategies[i];
    
    sections.push({
      type: 'concept',
      strategy,
      order: sectionOrder++,
    });

    // Insert checkpoint after every 2-3 concept sections
    // But not after the last one (reflection comes after)
    if (i < teachingStrategies.length - 1 && (i + 1) % 2 === 0) {
      sections.push({
        type: 'checkpoint',
        checkpointIndex: Math.floor((i + 1) / 2),
        order: sectionOrder++,
      });
    }
  }

  // Add analogy section for complex concepts
  if (concept.difficulty >= 3) {
    sections.push({
      type: 'analogy',
      order: sectionOrder++,
    });
  }

  // Always end with reflection
  sections.push({
    type: 'reflection',
    order: sectionOrder++,
  });

  return {
    conceptId,
    sections,
    estimatedTime: concept.estimatedTime,
  };
}

/**
 * Determine which teaching strategies to use for a concept
 * This is where the intelligence lives - adapts to learner and concept
 */
function determineTeachingStrategies(
  concept: { difficulty: number; level: string },
  learnerMastery: number,
  learnerConfidence: number
): TeachingStrategy[] {
  const strategies: TeachingStrategy[] = [];

  // For beginners or low mastery, start with explanation
  if (learnerMastery < 0.3 || concept.level === 'beginner') {
    strategies.push('explanation');
  }

  // Add analogy for abstract concepts
  if (concept.difficulty >= 3) {
    strategies.push('analogy');
  }

  // Use examples for practical concepts
  if (concept.difficulty >= 2) {
    strategies.push('example');
  }

  // Use questions to engage (Socratic method)
  // More questions for concepts where learner struggles
  if (learnerConfidence < 0.5 || concept.difficulty >= 3) {
    strategies.push('question');
  }

  // Ensure at least one strategy
  if (strategies.length === 0) {
    strategies.push('explanation');
  }

  return strategies;
}

/**
 * Decide if remediation is needed based on checkpoint responses
 */
export function shouldTriggerRemediation(
  understandingScores: number[], // Array of checkpoint scores
  conceptDifficulty: number
): boolean {
  if (understandingScores.length === 0) return false;

  const averageScore = understandingScores.reduce((a, b) => a + b, 0) / understandingScores.length;
  const lowScores = understandingScores.filter(s => s < 0.5).length;

  // Trigger remediation if:
  // 1. Average understanding is below threshold (lower for harder concepts)
  // 2. Multiple checkpoints show low understanding
  const threshold = conceptDifficulty >= 4 ? 0.4 : 0.5;
  
  return averageScore < threshold || lowScores >= 2;
}

