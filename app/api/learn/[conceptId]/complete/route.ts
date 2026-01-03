/**
 * Complete Concept API Route
 * Marks a concept as completed and unlocks next concepts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getOrCreateLearnerProfile, updateConceptMastery, getAllConceptMasteries } from '@/lib/db/queries';
import { getConceptById, getAvailableConcepts } from '@/lib/knowledge-graph/python-graph';
import { updateLearningSession } from '@/lib/db/queries';

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
    const { sessionId } = body;

    const concept = getConceptById(conceptId);
    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    const profile = await getOrCreateLearnerProfile(user.id, 'python');

    // Mark concept as completed
    await updateConceptMastery(profile.id, conceptId, {
      status: 'completed',
      masteryScore: 1.0,
      confidenceScore: 1.0,
    });

    // Complete learning session
    if (sessionId) {
      await updateLearningSession(sessionId, {
        completedAt: new Date(),
        sectionsCompleted: 100, // Mark as fully completed
      });
    }

    // Get all completed concepts to unlock next ones
    const allMasteries = await getAllConceptMasteries(profile.id);
    const completedIds = allMasteries
      .filter(m => m.status === 'completed')
      .map(m => m.conceptId);

    // Unlock available concepts
    const availableConcepts = getAvailableConcepts(completedIds);
    for (const availableConcept of availableConcepts) {
      const existing = allMasteries.find(m => m.conceptId === availableConcept.id);
      if (!existing || existing.status === 'locked') {
        await updateConceptMastery(profile.id, availableConcept.id, {
          status: 'available',
        });
      }
    }

    return NextResponse.json({
      success: true,
      nextConcepts: availableConcepts.map(c => c.id),
    });
  } catch (error) {
    console.error('Complete concept error:', error);
    return NextResponse.json(
      { error: 'Failed to complete concept' },
      { status: 500 }
    );
  }
}

