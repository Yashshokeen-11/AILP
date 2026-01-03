/**
 * Teaching Service
 * 
 * Core service that generates learning content using the Socratic method
 * and first principles teaching approach.
 */

import { createLLMClient } from './llm-client';
import { Concept } from '@/lib/knowledge-graph/python-graph';

export interface LearningSection {
  type: 'introduction' | 'concept' | 'checkpoint' | 'analogy' | 'reflection';
  content?: string;
  question?: string;
  hint?: string;
}

export interface LearningContent {
  title: string;
  sections: LearningSection[];
}

export class TeachingService {
  private llm: ReturnType<typeof createLLMClient>;

  constructor() {
    this.llm = createLLMClient();
  }

  /**
   * Generate learning content for a concept
   */
  async generateLearningContent(
    concept: Concept,
    learnerContext?: {
      background?: string;
      goals?: string;
      previousConcepts?: string[];
    }
  ): Promise<LearningContent> {
    const systemPrompt = `You are an expert teacher who teaches programming from first principles using the Socratic method. Your teaching style:

1. **First Principles**: Always build understanding from fundamental concepts, never assume prior knowledge
2. **Socratic Method**: Use thoughtful questions (checkpoints) to guide discovery, not long explanations
3. **No Monologues**: Keep explanations concise and interactive
4. **Analogies**: Use relatable analogies to build intuition
5. **Reflection**: Include moments for learners to reflect on what they've learned

Structure your teaching as a series of sections:
- **introduction**: Build context and motivation (1-2 paragraphs)
- **concept**: Core concept explanation with code examples (2-3 paragraphs + code)
- **checkpoint**: A thoughtful question that tests understanding (not just recall)
- **analogy**: Help build intuition with relatable comparisons
- **reflection**: Encourage meta-cognition about the learning

Keep each section focused and avoid overwhelming the learner.`;

    const userPrompt = `Generate learning content for the concept: "${concept.title}"

Description: ${concept.description}
Level: ${concept.level}
Difficulty: ${concept.difficulty}/5

${learnerContext?.background ? `Learner background: ${learnerContext.background}` : ''}
${learnerContext?.goals ? `Learner goals: ${learnerContext.goals}` : ''}
${learnerContext?.previousConcepts?.length ? `Previously learned: ${learnerContext.previousConcepts.join(', ')}` : ''}

Generate 5-8 sections that teach this concept from first principles. Include:
- 1 introduction section
- 2-3 concept sections (break complex ideas into digestible parts)
- 2-3 checkpoint sections (thoughtful questions, not just "what is X?")
- 1 analogy section
- 1 reflection section

Return ONLY valid JSON in this exact format:
{
  "title": "Concept Title",
  "sections": [
    {
      "type": "introduction",
      "content": "Introduction text..."
    },
    {
      "type": "concept",
      "content": "Concept explanation with **bold** for emphasis and \`\`\`python\ncode\n\`\`\` for code blocks"
    },
    {
      "type": "checkpoint",
      "question": "Thoughtful question that tests understanding",
      "hint": "Helpful hint if they're stuck"
    },
    {
      "type": "analogy",
      "content": "Analogy content..."
    },
    {
      "type": "reflection",
      "content": "Reflection prompt..."
    }
  ]
}`;

    try {
      const response = await this.llm.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.8,
        maxTokens: 3000,
      });

      // Parse JSON response (handle markdown code blocks if present)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      const content = JSON.parse(jsonStr) as LearningContent;

      // Validate structure
      if (!content.title || !Array.isArray(content.sections)) {
        throw new Error('Invalid content structure');
      }

      return content;
    } catch (error) {
      console.error('Error generating learning content:', error);
      // Return fallback content
      return this.getFallbackContent(concept);
    }
  }

  /**
   * Analyze assessment responses to detect weaknesses and determine starting point
   */
  async analyzeAssessment(responses: Array<{ questionId: string; responseText: string }>): Promise<{
    detectedWeaknesses: string[];
    startingConcept?: string;
    confidence: number;
  }> {
    const systemPrompt = `You are an expert at analyzing learner responses to understand their background and identify knowledge gaps.`;

    const userPrompt = `Analyze these assessment responses and identify:
1. Any foundational weaknesses or gaps
2. The appropriate starting concept (from: intro, variables, operations, conditionals, loops, functions, lists, dictionaries, files, oop, modules, project)
3. Overall confidence level (0-1)

Responses:
${responses.map((r, i) => `Q${i + 1}: ${r.responseText}`).join('\n')}

Return ONLY valid JSON:
{
  "detectedWeaknesses": ["weakness1", "weakness2"],
  "startingConcept": "concept_id",
  "confidence": 0.75
}`;

    try {
      const response = await this.llm.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.3,
        maxTokens: 500,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : response;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error analyzing assessment:', error);
      return {
        detectedWeaknesses: [],
        startingConcept: 'intro',
        confidence: 0.5,
      };
    }
  }

  /**
   * Generate feedback for checkpoint responses
   */
  async generateCheckpointFeedback(
    question: string,
    userResponse: string,
    concept: Concept
  ): Promise<string> {
    const systemPrompt = `You are a supportive teacher providing feedback on learner responses. Be encouraging, specific, and guide them toward deeper understanding.`;

    const userPrompt = `The learner was asked: "${question}"

Their response: "${userResponse}"

Concept being learned: ${concept.title}

Provide brief, encouraging feedback (2-3 sentences) that:
- Acknowledges their thinking
- Gently guides them if they're off track
- Reinforces key concepts

Keep it concise and supportive.`;

    try {
      const feedback = await this.llm.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.7,
        maxTokens: 200,
      });

      return feedback.trim();
    } catch (error) {
      console.error('Error generating feedback:', error);
      return 'Great thinking! Keep exploring these ideas.';
    }
  }

  /**
   * Fallback content when LLM fails
   */
  private getFallbackContent(concept: Concept): LearningContent {
    return {
      title: concept.title,
      sections: [
        {
          type: 'introduction',
          content: `Let's explore ${concept.title}. This is an important concept that builds on what you've learned so far.`,
        },
        {
          type: 'concept',
          content: `**Core Concept**\n\n${concept.description}\n\nWe'll break this down step by step.`,
        },
        {
          type: 'checkpoint',
          question: `What questions do you have about ${concept.title}?`,
          hint: 'Think about how this relates to what you already know.',
        },
        {
          type: 'reflection',
          content: `Take a moment to think about how ${concept.title} fits into your overall learning journey.`,
        },
      ],
    };
  }
}

