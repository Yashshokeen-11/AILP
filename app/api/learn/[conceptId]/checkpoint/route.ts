/**
 * Checkpoint Submission API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/get-user';
import { saveCheckpointResponse, updateLearningSession } from '@/lib/db/queries';
import { getConceptById } from '@/lib/knowledge-graph/python-graph';
import { TeachingService } from '@/lib/services/teaching-service';

const checkpointSchema = z.object({
  sessionId: z.string(),
  checkpointIndex: z.number(),
  responseText: z.string().min(1),
  question: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { conceptId } = params;
    const body = await request.json();
    const { sessionId, checkpointIndex, responseText, question } = checkpointSchema.parse(body);

    const concept = getConceptById(conceptId);
    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    // Generate feedback
    const teachingService = new TeachingService();
    const feedback = await teachingService.generateCheckpointFeedback(
      question,
      responseText,
      concept
    );

    // Save checkpoint response
    await saveCheckpointResponse(
      sessionId,
      checkpointIndex,
      responseText,
      0.75, // Understanding score (could be improved with LLM analysis)
      feedback
    );

    // Update session progress
    await updateLearningSession(sessionId, {
      sectionsCompleted: checkpointIndex + 1,
    });

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Checkpoint submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit checkpoint' },
      { status: 500 }
    );
  }
}

