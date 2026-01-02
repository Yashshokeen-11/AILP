/**
 * Python Knowledge Graph
 * 
 * Defines the complete learning path for Python beginners with:
 * - Concept definitions
 * - Prerequisite dependencies
 * - Difficulty levels
 * - Estimated learning times
 */

export interface Concept {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'confident';
  prerequisites: string[];
  estimatedTime: number; // minutes
  difficulty: number; // 1-5 scale
}

export const PYTHON_KNOWLEDGE_GRAPH: Concept[] = [
  // BEGINNER LEVEL
  {
    id: 'intro',
    title: 'What is Programming?',
    description: 'Understanding what programming is and how Python fits in',
    level: 'beginner',
    prerequisites: [],
    estimatedTime: 15,
    difficulty: 1
  },
  {
    id: 'variables',
    title: 'Variables & Data Types',
    description: 'Storing and working with different types of data',
    level: 'beginner',
    prerequisites: ['intro'],
    estimatedTime: 25,
    difficulty: 2
  },
  {
    id: 'operations',
    title: 'Basic Operations',
    description: 'Arithmetic and basic operations with numbers',
    level: 'beginner',
    prerequisites: ['variables'],
    estimatedTime: 20,
    difficulty: 2
  },
  {
    id: 'conditionals',
    title: 'Making Decisions (if/else)',
    description: 'Controlling program flow with conditions',
    level: 'beginner',
    prerequisites: ['operations'],
    estimatedTime: 30,
    difficulty: 3
  },
  {
    id: 'loops',
    title: 'Repetition & Loops',
    description: 'Repeating actions with for and while loops',
    level: 'beginner',
    prerequisites: ['conditionals'],
    estimatedTime: 35,
    difficulty: 3
  },
  
  // INTERMEDIATE LEVEL
  {
    id: 'functions',
    title: 'Creating Functions',
    description: 'Organizing code into reusable functions',
    level: 'intermediate',
    prerequisites: ['loops'],
    estimatedTime: 40,
    difficulty: 3
  },
  {
    id: 'lists',
    title: 'Working with Lists',
    description: 'Storing and manipulating collections of data',
    level: 'intermediate',
    prerequisites: ['functions'],
    estimatedTime: 35,
    difficulty: 3
  },
  {
    id: 'dictionaries',
    title: 'Dictionaries & Data Structures',
    description: 'Key-value pairs and organizing complex data',
    level: 'intermediate',
    prerequisites: ['lists'],
    estimatedTime: 40,
    difficulty: 4
  },
  {
    id: 'files',
    title: 'Reading & Writing Files',
    description: 'Persisting data to and from files',
    level: 'intermediate',
    prerequisites: ['dictionaries'],
    estimatedTime: 30,
    difficulty: 3
  },
  
  // CONFIDENT LEVEL
  {
    id: 'oop',
    title: 'Object-Oriented Thinking',
    description: 'Classes, objects, and organizing code with OOP',
    level: 'confident',
    prerequisites: ['files'],
    estimatedTime: 50,
    difficulty: 4
  },
  {
    id: 'modules',
    title: 'Using Libraries & Modules',
    description: 'Leveraging existing code and packages',
    level: 'confident',
    prerequisites: ['oop'],
    estimatedTime: 30,
    difficulty: 3
  },
  {
    id: 'project',
    title: 'Building Your First Project',
    description: 'Putting it all together in a real project',
    level: 'confident',
    prerequisites: ['modules'],
    estimatedTime: 60,
    difficulty: 5
  }
];

/**
 * Get a concept by ID
 */
export function getConceptById(id: string): Concept | undefined {
  return PYTHON_KNOWLEDGE_GRAPH.find(c => c.id === id);
}

/**
 * Get all concepts that can be unlocked given completed concept IDs
 * Returns concepts where all prerequisites are met
 */
export function getAvailableConcepts(completedConceptIds: string[]): Concept[] {
  return PYTHON_KNOWLEDGE_GRAPH.filter(concept => {
    // If already completed, not available
    if (completedConceptIds.includes(concept.id)) {
      return false;
    }
    
    // Check if all prerequisites are met
    return concept.prerequisites.every(prereq => 
      completedConceptIds.includes(prereq)
    );
  });
}

/**
 * Get the next recommended concept for a learner
 * Returns the first available concept (maintains order in knowledge graph)
 */
export function getNextConcept(completedConceptIds: string[]): Concept | null {
  const available = getAvailableConcepts(completedConceptIds);
  
  // Return the first available concept (maintains order)
  return available.length > 0 ? available[0] : null;
}

/**
 * Get all concepts in a specific level
 */
export function getConceptsByLevel(level: Concept['level']): Concept[] {
  return PYTHON_KNOWLEDGE_GRAPH.filter(c => c.level === level);
}

/**
 * Check if a concept can be unlocked (all prerequisites completed)
 */
export function canUnlockConcept(conceptId: string, completedConceptIds: string[]): boolean {
  const concept = getConceptById(conceptId);
  if (!concept) return false;
  
  return concept.prerequisites.every(prereq => 
    completedConceptIds.includes(prereq)
  );
}

