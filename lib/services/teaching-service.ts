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

Return ONLY valid JSON in this exact format. IMPORTANT: All newlines in string values must be escaped as \\\\n (double backslash + n), not actual newlines. All JSON must be properly formatted and parseable:

{
  "title": "Concept Title",
  "sections": [
    {
      "type": "introduction",
      "content": "Introduction text with \\\\n for line breaks, not actual newlines"
    },
    {
      "type": "concept",
      "content": "Concept explanation with **bold** for emphasis and code blocks. Use \\\\n for line breaks."
    },
    {
      "type": "checkpoint",
      "question": "Thoughtful question that tests understanding",
      "hint": "Helpful hint if they are stuck"
    },
    {
      "type": "analogy",
      "content": "Analogy content with \\\\n for line breaks"
    },
    {
      "type": "reflection",
      "content": "Reflection prompt with \\\\n for line breaks"
    }
  ]
}

CRITICAL: Ensure all string values use \\\\n (double backslash + n) for newlines, not actual newline characters. The JSON must be valid and parseable.`;

    let response: string | undefined;
    try {
      console.log(`[TeachingService] Generating content for: ${concept.title}`);
      console.log(`[TeachingService] Using LLM client...`);
      
      response = await this.llm.generate([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ], {
        temperature: 0.8,
        maxTokens: 3000,
      });

      console.log(`[TeachingService] Received response from LLM (length: ${response.length})`);
      console.log(`[TeachingService] Response preview (first 200 chars):`, response.substring(0, 200));

      // Parse JSON response (handle markdown code blocks if present)
      let jsonStr = response;
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
        console.log(`[TeachingService] Extracted JSON from markdown code block`);
      }

      console.log(`[TeachingService] Parsing JSON (length: ${jsonStr.length})...`);
      let content: LearningContent;
      
      try {
        // First attempt: direct parse
        content = JSON.parse(jsonStr) as LearningContent;
      } catch (parseError: any) {
        // If parsing fails due to control characters, fix them
        console.warn('[TeachingService] First parse attempt failed:', parseError.message);
        console.log('[TeachingService] Attempting to fix control characters in JSON...');
        
        // Use a simpler, more reliable approach: replace control characters in string values
        // This regex-based approach is more reliable than character-by-character
        let fixedJson = jsonStr;
        
        // Strategy 1: Fix unescaped newlines, tabs, and carriage returns in string values
        // Match string values (content between quotes, handling escaped quotes)
        fixedJson = fixedJson.replace(/"([^"\\]|\\.)*"/g, (match) => {
          // Only process if it's a content string (not a key)
          // Check if it contains unescaped control characters
          if (match.includes('\n') || match.includes('\r') || match.includes('\t')) {
            // Escape control characters, but preserve already-escaped ones
            return match
              .replace(/([^\\])\n/g, '$1\\n')  // Escape unescaped newlines
              .replace(/([^\\])\r/g, '$1\\r')  // Escape unescaped carriage returns
              .replace(/([^\\])\t/g, '$1\\t') // Escape unescaped tabs
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove other control chars
          }
          return match;
        });
        
        try {
          content = JSON.parse(fixedJson) as LearningContent;
          console.log('[TeachingService] Successfully parsed JSON after fixing control characters');
        } catch (secondError: any) {
          // If that still fails, try a more aggressive approach
          console.warn('[TeachingService] Second parse attempt failed:', secondError.message);
          console.log('[TeachingService] Trying aggressive JSON cleanup...');
          
          // More aggressive: escape control characters that aren't already escaped
          // Process character by character to handle escaping properly
          let aggressiveFix = '';
          for (let i = 0; i < jsonStr.length; i++) {
            const char = jsonStr[i];
            const prevChar = i > 0 ? jsonStr[i - 1] : '';
            
            // If previous char was backslash, this is escaped - keep as is
            if (prevChar === '\\') {
              aggressiveFix += char;
              continue;
            }
            
            // Escape unescaped control characters
            if (char === '\n') {
              aggressiveFix += '\\n';
            } else if (char === '\r') {
              aggressiveFix += '\\r';
            } else if (char === '\t') {
              aggressiveFix += '\\t';
            } else if (char.charCodeAt(0) >= 0 && char.charCodeAt(0) < 32 && char !== '\n' && char !== '\r' && char !== '\t') {
              // Remove other control characters
              continue;
            } else {
              aggressiveFix += char;
            }
          }
          fixedJson = aggressiveFix;
          
          try {
            content = JSON.parse(fixedJson) as LearningContent;
            console.log('[TeachingService] Successfully parsed JSON after aggressive cleanup');
          } catch (thirdError) {
            console.error('[TeachingService] All JSON parsing attempts failed');
            console.error('[TeachingService] JSON string (first 500 chars):', jsonStr.substring(0, 500));
            throw parseError; // Throw original error
          }
        }
      }

      // Validate structure
      if (!content.title || !Array.isArray(content.sections)) {
        console.error('[TeachingService] Invalid content structure:', { title: content.title, sectionsCount: content.sections?.length });
        throw new Error('Invalid content structure');
      }

      console.log(`[TeachingService] Successfully generated content: "${content.title}" with ${content.sections.length} sections`);
      return content;
    } catch (error) {
      console.error('[TeachingService] Error generating learning content:', error);
      if (error instanceof SyntaxError && response) {
        console.error('[TeachingService] JSON parse error. This usually means the LLM response was not valid JSON.');
        console.error('[TeachingService] Raw response (first 1000 chars):', response.substring(0, 1000));
      }
      // Re-throw the error so the API route can handle it properly
      // Don't silently return fallback content - let the caller decide
      throw new Error(`Failed to generate learning content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

