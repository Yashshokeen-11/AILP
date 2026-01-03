/**
 * Learning Content API Route
 * Generates or retrieves learning content for a concept
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getOrCreateLearnerProfile, getConceptMastery, createLearningSession } from '@/lib/db/queries';
import { getConceptById } from '@/lib/knowledge-graph/python-graph';
import { TeachingService } from '@/lib/services/teaching-service';
import { getAllConceptMasteries } from '@/lib/db/queries';

export async function GET(
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
    const concept = getConceptById(conceptId);

    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    const profile = await getOrCreateLearnerProfile(user.id, 'python');
    const mastery = await getConceptMastery(profile.id, conceptId);

    // Check if concept is available
    if (!mastery || mastery.status === 'locked') {
      // Check prerequisites
      const allMasteries = await getAllConceptMasteries(profile.id);
      const completedIds = allMasteries
        .filter(m => m.status === 'completed')
        .map(m => m.conceptId);
      
      const allPrereqsMet = concept.prerequisites.every(prereq =>
        completedIds.includes(prereq)
      );

      if (!allPrereqsMet && concept.prerequisites.length > 0) {
        return NextResponse.json(
          { error: 'Prerequisites not met' },
          { status: 403 }
        );
      }
    }

    // Generate learning content
    const teachingService = new TeachingService();
    const content = await teachingService.generateLearningContent(concept, {
      previousConcepts: concept.prerequisites,
    });

    // Create or update learning session
    const session = await createLearningSession(
      profile.id,
      conceptId,
      content.sections.length
    );

    // Mark concept as in_progress if not already
    if (mastery && mastery.status !== 'in_progress' && mastery.status !== 'completed') {
      // Update will be handled by the learning page
    }

    return NextResponse.json({
      concept: {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        level: concept.level,
      },
      content,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Learning content error:', error);
    return NextResponse.json(
      { error: 'Failed to get learning content' },
      { status: 500 }
    );
  }
}

