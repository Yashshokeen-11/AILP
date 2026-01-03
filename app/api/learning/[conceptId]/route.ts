/**
 * Learning Content API
 * 
 * GET /api/learning/[conceptId]
 * 
 * Generates personalized learning content for a concept
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateLessonPlan } from '@/lib/services/teaching/strategy-controller';
import { generateLessonContent } from '@/lib/services/teaching/content-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { conceptId } = params;
    const searchParams = request.nextUrl.searchParams;
    
    // Get learner context (in real app, from database)
    const learnerMastery = parseFloat(searchParams.get('mastery') || '0');
    const learnerConfidence = parseFloat(searchParams.get('confidence') || '0');
    const learnerContext = searchParams.get('context') || undefined;

    // Generate lesson plan (decides structure)
    const lessonPlan = generateLessonPlan(conceptId, learnerMastery, learnerConfidence);

    // Generate content (fills in the structure)
    const content = await generateLessonContent(lessonPlan, learnerContext);

    return NextResponse.json(content);
  } catch (error) {
    console.error('Learning content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning content' },
      { status: 500 }
    );
  }
}

