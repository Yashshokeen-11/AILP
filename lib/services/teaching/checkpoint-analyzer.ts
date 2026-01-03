/**
 * Checkpoint Analyzer
 * 
 * Analyzes learner responses to checkpoints and:
 * 1. Assesses understanding level
 * 2. Provides feedback
 * 3. Determines if remediation is needed
 */

import { getDefaultLLMClient } from '../llm/client';
import { createCheckpointAnalysisPrompt } from '../llm/prompts';

export interface CheckpointAnalysis {
  understandingScore: number; // 0.0 to 1.0
  feedback: string;
  needsRemediation: boolean;
  remediationReason?: string;
}

/**
 * Analyze a checkpoint response
 */
export async function analyzeCheckpoint(
  question: string,
  learnerResponse: string,
  conceptId: string
): Promise<CheckpointAnalysis> {
  const llm = getDefaultLLMClient();
  
  const prompt = createCheckpointAnalysisPrompt(question, learnerResponse, conceptId);
  const response = await llm.chat(prompt, { temperature: 0.3 });
  
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    return {
      understandingScore: Math.max(0, Math.min(1, json.understandingScore || 0.5)),
      feedback: json.feedback || 'Good thinking! Keep going.',
      needsRemediation: json.needsRemediation || false,
      remediationReason: json.remediationReason,
    };
  } catch (error) {
    console.error('Failed to parse checkpoint analysis:', error);
    
    // Fallback: simple heuristic based on response length and keywords
    const score = estimateUnderstanding(learnerResponse);
    
    return {
      understandingScore: score,
      feedback: score > 0.6 
        ? 'Good understanding! You\'re on the right track.'
        : 'Let\'s think about this more. Consider the key concepts we discussed.',
      needsRemediation: score < 0.4,
      remediationReason: score < 0.4 ? 'Understanding appears incomplete' : undefined,
    };
  }
}

/**
 * Simple heuristic fallback for understanding estimation
 */
function estimateUnderstanding(response: string): number {
  if (!response || response.trim().length < 10) return 0.2;
  if (response.length < 30) return 0.4;
  if (response.length > 100) return 0.7;
  return 0.6;
}

