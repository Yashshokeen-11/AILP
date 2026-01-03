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

    // Generate learning content using AI (Gemini)
    console.log(`[API] Generating AI content for concept: ${concept.title} (${conceptId})`);
    const teachingService = new TeachingService();
    let content;
    try {
      content = await teachingService.generateLearningContent(concept, {
        previousConcepts: concept.prerequisites,
      });
      console.log(`[API] Successfully generated content: "${content.title}" with ${content.sections.length} sections`);
      console.log(`[API] Section types:`, content.sections.map(s => s.type));
    } catch (error) {
      console.error('[API] Error generating learning content:', error);
      console.error('[API] Error details:', error instanceof Error ? error.stack : error);
      // Return a more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { 
          error: 'Failed to generate learning content. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    // Validate content was generated
    if (!content || !content.sections || content.sections.length === 0) {
      console.error('[API] Generated content is empty or invalid:', { 
        hasContent: !!content, 
        sectionsCount: content?.sections?.length 
      });
      return NextResponse.json(
        { error: 'Failed to generate learning content. Generated content is empty.' },
        { status: 500 }
      );
    }

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

