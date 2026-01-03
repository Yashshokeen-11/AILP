/**
 * Content Generator
 * 
 * Generates actual teaching content based on lesson plan.
 * Uses LLM to generate content, but follows the structure decided by strategy controller.
 */

import { getDefaultLLMClient } from '../llm/client';
import { createTeachingContentPrompt } from '../llm/prompts';
import { LessonPlan, TeachingSection } from './strategy-controller';
import { getConceptById } from '@/lib/knowledge-graph/python-graph';

export interface GeneratedContent {
  type: string;
  content?: string;
  question?: string;
  hint?: string;
}

export interface LessonContent {
  conceptId: string;
  title: string;
  sections: GeneratedContent[];
}

/**
 * Generate full lesson content from lesson plan
 */
export async function generateLessonContent(
  lessonPlan: LessonPlan,
  learnerContext?: string
): Promise<LessonContent> {
  const concept = getConceptById(lessonPlan.conceptId);
  if (!concept) {
    throw new Error(`Concept not found: ${lessonPlan.conceptId}`);
  }

  const llm = getDefaultLLMClient();
  const sections: GeneratedContent[] = [];

  for (const section of lessonPlan.sections) {
    if (section.type === 'introduction') {
      const content = await generateIntroduction(concept.title, concept.description, llm, learnerContext);
      sections.push({ type: 'introduction', content });
    } else if (section.type === 'concept' && section.strategy) {
      const content = await generateConceptSection(
        lessonPlan.conceptId,
        concept.title,
        section.strategy,
        llm,
        learnerContext
      );
      sections.push({ type: 'concept', content });
    } else if (section.type === 'checkpoint') {
      const checkpoint = await generateCheckpoint(
        lessonPlan.conceptId,
        concept.title,
        section.checkpointIndex || 0,
        llm
      );
      sections.push({
        type: 'checkpoint',
        question: checkpoint.question,
        hint: checkpoint.hint,
      });
    } else if (section.type === 'analogy') {
      const content = await generateAnalogy(lessonPlan.conceptId, concept.title, llm);
      sections.push({ type: 'analogy', content });
    } else if (section.type === 'reflection') {
      const content = await generateReflection(concept.title, llm);
      sections.push({ type: 'reflection', content });
    }
  }

  return {
    conceptId: lessonPlan.conceptId,
    title: concept.title,
    sections,
  };
}

async function generateIntroduction(
  title: string,
  description: string,
  llm: any,
  learnerContext?: string
): Promise<string> {
  const prompt = [
    {
      role: 'system',
      content: 'You are an expert teacher. Write engaging introductions that build intuition before diving into details.',
    },
    {
      role: 'user',
      content: `Write a 2-3 paragraph introduction for "${title}".

Description: ${description}
${learnerContext ? `Learner context: ${learnerContext}` : ''}

Make it engaging and intuitive. Connect to real-world examples. Don't use markdown.`,
    },
  ];

  const response = await llm.chat(prompt, { temperature: 0.8 });
  return response.content;
}

async function generateConceptSection(
  conceptId: string,
  title: string,
  strategy: string,
  llm: any,
  learnerContext?: string
): Promise<string> {
  const prompt = createTeachingContentPrompt(conceptId, title, strategy as any, learnerContext);
  const response = await llm.chat(prompt, { temperature: 0.7 });
  return response.content;
}

async function generateCheckpoint(
  conceptId: string,
  title: string,
  index: number,
  llm: any
): Promise<{ question: string; hint: string }> {
  const prompt = [
    {
      role: 'system',
      content: 'You are an expert teacher using the Socratic method. Create thoughtful questions that guide discovery.',
    },
    {
      role: 'user',
      content: `Create a checkpoint question for "${title}" (concept: ${conceptId}).

This is checkpoint ${index + 1}. The question should:
- Test understanding of key concepts
- Encourage reflection
- Not be a simple yes/no question
- Be answerable in 2-3 sentences

Return JSON:
{
  "question": "The question text",
  "hint": "A helpful hint if the learner gets stuck"
}`,
    },
  ];

  const response = await llm.chat(prompt, { temperature: 0.7 });
  
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const json = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    return {
      question: json.question || 'Reflect on what you\'ve learned so far.',
      hint: json.hint || 'Think about the core concept we just discussed.',
    };
  } catch {
    return {
      question: 'What is the key takeaway from this section?',
      hint: 'Consider the main concept we just explored.',
    };
  }
}

async function generateAnalogy(conceptId: string, title: string, llm: any): Promise<string> {
  const prompt = [
    {
      role: 'system',
      content: 'You are an expert at creating relatable analogies that build intuition.',
    },
    {
      role: 'user',
      content: `Create an analogy for "${title}" (concept: ${conceptId}).

Make it relatable and help build intuition. Use a real-world comparison. 2-3 paragraphs. No markdown.`,
    },
  ];

  const response = await llm.chat(prompt, { temperature: 0.8 });
  return response.content;
}

async function generateReflection(title: string, llm: any): Promise<string> {
  const prompt = [
    {
      role: 'system',
      content: 'You are a thoughtful teacher who encourages reflection.',
    },
    {
      role: 'user',
      content: `Write a brief reflection prompt for "${title}".

Encourage the learner to think about what they've learned and how it connects to bigger concepts. 1-2 sentences. No markdown.`,
    },
  ];

  const response = await llm.chat(prompt, { temperature: 0.7 });
  return response.content;
}

