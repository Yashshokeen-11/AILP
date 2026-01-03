/**
 * Weak Point Recognition Engine
 * 
 * Detects repeated errors and learning gaps.
 * Classifies weakness types and triggers remediation.
 */

import { getDefaultLLMClient } from '../llm/client';
import { createWeakPointDetectionPrompt } from '../llm/prompts';

export type WeaknessType = 'conceptual' | 'foundational' | 'application';

export interface WeakPoint {
  conceptId: string;
  weaknessType: WeaknessType;
  severity: number; // 0.0 to 1.0
  rootCause: string;
  relatedConcepts: string[];
}

/**
 * Detect weak points from error patterns
 */
export async function detectWeakPoints(
  conceptId: string,
  errorPatterns: string[],
  attempts: number
): Promise<WeakPoint | null> {
  if (errorPatterns.length === 0 || attempts < 2) {
    return null; // Need multiple attempts to detect patterns
  }

  const llm = getDefaultLLMClient();
  const prompt = createWeakPointDetectionPrompt(conceptId, errorPatterns, attempts);
  const response = await llm.chat(prompt, { temperature: 0.3 });

  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    
    return {
      conceptId,
      weaknessType: json.weaknessType || 'conceptual',
      severity: Math.max(0, Math.min(1, json.severity || 0.5)),
      rootCause: json.rootCause || 'Pattern of errors detected',
      relatedConcepts: json.relatedConcepts || [],
    };
  } catch (error) {
    console.error('Failed to parse weak point detection:', error);
    
    // Fallback: simple heuristic
    return {
      conceptId,
      weaknessType: 'conceptual',
      severity: Math.min(0.7, attempts * 0.15),
      rootCause: 'Repeated errors suggest conceptual gap',
      relatedConcepts: [],
    };
  }
}

/**
 * Check if weak point severity warrants remediation
 */
export function shouldTriggerRemediation(weakPoint: WeakPoint): boolean {
  // Trigger if severity is high OR if it's foundational (prerequisite issue)
  return weakPoint.severity > 0.6 || weakPoint.weaknessType === 'foundational';
}

