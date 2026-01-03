/**
 * Prompt Templates
 * 
 * Centralized prompt templates for consistent LLM interactions.
 * All prompts follow the teaching philosophy: first principles, Socratic method, adaptive.
 */

import { LLMMessage } from './types';

/**
 * Prompt for analyzing assessment responses
 * Returns structured JSON with confidence scores and weak points
 */
export function createAssessmentAnalysisPrompt(responses: Array<{ question: string; answer: string }>): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert educational assessment analyzer. Your job is to analyze learner responses to diagnostic questions and identify:
1. Their starting knowledge level
2. Confidence scores for different Python concepts (0.0 to 1.0)
3. Any weak foundational concepts that need attention

Be precise and objective. Return ONLY valid JSON.`
    },
    {
      role: 'user',
      content: `Analyze these assessment responses and provide a JSON object with:
{
  "overallLevel": "beginner" | "intermediate" | "confident",
  "conceptConfidence": {
    "intro": 0.0-1.0,
    "variables": 0.0-1.0,
    "operations": 0.0-1.0,
    "conditionals": 0.0-1.0,
    "loops": 0.0-1.0,
    "functions": 0.0-1.0,
    "lists": 0.0-1.0,
    "dictionaries": 0.0-1.0,
    "files": 0.0-1.0,
    "oop": 0.0-1.0,
    "modules": 0.0-1.0,
    "project": 0.0-1.0
  },
  "weakPoints": ["concept_id1", "concept_id2"],
  "insights": "Brief summary of learner's background and needs"
}

Assessment Responses:
${responses.map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`).join('\n\n')}`
    }
  ];
}

/**
 * Prompt for generating teaching content
 * The teaching strategy controller decides WHAT to teach, this generates HOW
 */
export function createTeachingContentPrompt(
  conceptId: string,
  conceptTitle: string,
  strategy: 'explanation' | 'analogy' | 'question' | 'example',
  learnerContext?: string
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert Python teacher who teaches from first principles using the Socratic method. Your teaching style:
- Build intuition before showing code
- Use analogies and real-world examples
- Ask thoughtful questions (don't just lecture)
- Break complex ideas into digestible sections
- Avoid long monologues - keep sections concise (2-3 paragraphs max)

Generate content that matches the requested teaching strategy.`
    },
    {
      role: 'user',
      content: `Generate teaching content for: "${conceptTitle}" (concept: ${conceptId})

Teaching Strategy: ${strategy}
${learnerContext ? `Learner Context: ${learnerContext}` : ''}

Generate content following these rules:
- If strategy is "explanation": Explain the concept clearly from first principles
- If strategy is "analogy": Use a relatable analogy to build intuition
- If strategy is "question": Pose a thoughtful question that guides discovery
- If strategy is "example": Show a practical example with explanation

Keep it concise (2-3 paragraphs). Don't use markdown formatting - return plain text.`
    }
  ];
}

/**
 * Prompt for analyzing checkpoint responses
 * Determines understanding level and provides feedback
 */
export function createCheckpointAnalysisPrompt(
  question: string,
  learnerResponse: string,
  conceptId: string
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert teacher analyzing a learner's checkpoint response. Your job:
1. Assess understanding (score 0.0 to 1.0)
2. Provide encouraging, constructive feedback
3. Identify if remediation is needed

Be encouraging but honest. Return ONLY valid JSON.`
    },
    {
      role: 'user',
      content: `Analyze this checkpoint response:

Question: ${question}
Learner Response: ${learnerResponse}
Concept: ${conceptId}

Return JSON:
{
  "understandingScore": 0.0-1.0,
  "feedback": "Encouraging feedback message",
  "needsRemediation": boolean,
  "remediationReason": "Why remediation is needed (if applicable)"
}`
    }
  ];
}

/**
 * Prompt for detecting weak points from error patterns
 */
export function createWeakPointDetectionPrompt(
  conceptId: string,
  errorPatterns: string[],
  attempts: number
): LLMMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert at identifying learning gaps. Analyze error patterns to determine:
1. Weakness type: "conceptual" (doesn't understand the idea) or "foundational" (missing prerequisite knowledge)
2. Severity: 0.0 to 1.0
3. Root cause analysis

Return ONLY valid JSON.`
    },
    {
      role: 'user',
      content: `Analyze these error patterns for concept "${conceptId}":

Errors observed (${attempts} attempts):
${errorPatterns.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Return JSON:
{
  "weaknessType": "conceptual" | "foundational" | "application",
  "severity": 0.0-1.0,
  "rootCause": "Explanation of the underlying issue",
  "relatedConcepts": ["concept_id1", "concept_id2"]
}`
    }
  ];
}

