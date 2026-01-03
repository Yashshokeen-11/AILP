/**
 * Assessment Engine
 * 
 * Analyzes learner responses to diagnostic questions and:
 * 1. Determines starting knowledge level
 * 2. Assigns confidence scores to concepts
 * 3. Identifies weak foundational concepts
 * 
 * This is the entry point for personalization.
 */

import { getDefaultLLMClient } from '../llm/client';
import { createAssessmentAnalysisPrompt } from '../llm/prompts';
import { PYTHON_KNOWLEDGE_GRAPH } from '@/lib/knowledge-graph/python-graph';

export interface AssessmentResponse {
  question: string;
  answer: string;
}

export interface ConceptConfidence {
  [conceptId: string]: number; // 0.0 to 1.0
}

export interface AssessmentAnalysis {
  overallLevel: 'beginner' | 'intermediate' | 'confident';
  conceptConfidence: ConceptConfidence;
  weakPoints: string[]; // concept IDs
  insights: string;
}

/**
 * Analyze assessment responses and generate initial learner profile
 */
export async function analyzeAssessment(responses: AssessmentResponse[]): Promise<AssessmentAnalysis> {
  const llm = getDefaultLLMClient();
  
  // Get LLM analysis
  const prompt = createAssessmentAnalysisPrompt(responses);
  const llmResponse = await llm.chat(prompt, { temperature: 0.3 }); // Lower temperature for more consistent analysis
  
  // Parse JSON response
  let analysis: AssessmentAnalysis;
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = llmResponse.content.match(/```json\n?([\s\S]*?)\n?```/) || 
                     llmResponse.content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : llmResponse.content;
    analysis = JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse LLM response:', error);
    // Fallback to default beginner profile
    return getDefaultAnalysis();
  }

  // Validate and normalize confidence scores
  analysis.conceptConfidence = normalizeConfidenceScores(analysis.conceptConfidence);
  
  // Ensure weak points are valid concept IDs
  analysis.weakPoints = analysis.weakPoints.filter(id => 
    PYTHON_KNOWLEDGE_GRAPH.some(c => c.id === id)
  );

  return analysis;
}

/**
 * Normalize confidence scores to ensure they're between 0 and 1
 */
function normalizeConfidenceScores(scores: ConceptConfidence): ConceptConfidence {
  const normalized: ConceptConfidence = {};
  
  for (const concept of PYTHON_KNOWLEDGE_GRAPH) {
    const score = scores[concept.id];
    if (typeof score === 'number') {
      normalized[concept.id] = Math.max(0, Math.min(1, score));
    } else {
      // Default to 0 if not provided
      normalized[concept.id] = 0;
    }
  }
  
  return normalized;
}

/**
 * Default analysis for fallback
 */
function getDefaultAnalysis(): AssessmentAnalysis {
  const defaultConfidence: ConceptConfidence = {};
  for (const concept of PYTHON_KNOWLEDGE_GRAPH) {
    defaultConfidence[concept.id] = 0;
  }

  return {
    overallLevel: 'beginner',
    conceptConfidence: defaultConfidence,
    weakPoints: [],
    insights: 'New learner starting from the beginning.',
  };
}

/**
 * Convert confidence scores to initial mastery scores
 * Mastery is typically lower than confidence initially
 */
export function confidenceToMastery(confidence: number): number {
  // If confidence is high, mastery starts at 70% of confidence
  // If confidence is low, mastery starts even lower
  return Math.max(0, confidence * 0.7);
}

