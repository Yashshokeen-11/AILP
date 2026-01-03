/**
 * Assessment Submission API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getOrCreateLearnerProfile } from '@/lib/db/queries';
import { saveAssessmentResponse } from '@/lib/db/queries';
import { TeachingService } from '@/lib/services/teaching-service';
import { PYTHON_KNOWLEDGE_GRAPH, getConceptById } from '@/lib/knowledge-graph/python-graph';
import { initializeConceptMasteries, updateConceptMastery } from '@/lib/db/queries';

const assessmentSchema = z.object({
  responses: z.array(z.object({
    questionId: z.string(),
    responseText: z.string().min(1),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { responses } = assessmentSchema.parse(body);

    // Get or create learner profile
    const profile = await getOrCreateLearnerProfile(user.id, 'python');

    // Save all responses
    const teachingService = new TeachingService();
    const analysis = await teachingService.analyzeAssessment(responses);

    for (const response of responses) {
      await saveAssessmentResponse(
        profile.id,
        response.questionId,
        response.responseText,
        analysis
      );
    }

    // Initialize concept masteries based on analysis
    const startingConceptId = analysis.startingConcept || 'intro';
    const startingConcept = getConceptById(startingConceptId);
    
    if (startingConcept) {
      // Mark all concepts up to starting point as completed
      const conceptIndex = PYTHON_KNOWLEDGE_GRAPH.findIndex(c => c.id === startingConceptId);
      const completedIds = PYTHON_KNOWLEDGE_GRAPH
        .slice(0, conceptIndex)
        .map(c => c.id);

      await initializeConceptMasteries(profile.id, PYTHON_KNOWLEDGE_GRAPH, completedIds);
      
      // Mark starting concept as available
      await updateConceptMastery(profile.id, startingConceptId, {
        status: 'available',
      });
    } else {
      await initializeConceptMasteries(profile.id, PYTHON_KNOWLEDGE_GRAPH);
    }

    // Create weak points if detected
    if (analysis.detectedWeaknesses.length > 0) {
      // Weak points will be created by the teaching service
    }

    return NextResponse.json({
      success: true,
      analysis,
      startingConcept: startingConceptId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}

