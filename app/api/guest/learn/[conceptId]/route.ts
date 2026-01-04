/**
 * Guest Learning Content API Route
 * Returns learning content for guest users (same as regular users, but no progress tracking)
 */

import { NextResponse } from 'next/server';
import { getConceptById } from '@/lib/knowledge-graph/python-graph';
import { generateLearningContent } from '@/lib/services/teaching-service';

export async function GET(
  request: Request,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { conceptId } = params;
    
    if (!conceptId) {
      return NextResponse.json(
        { error: 'Concept ID is required' },
        { status: 400 }
      );
    }

    const concept = getConceptById(conceptId);
    if (!concept) {
      return NextResponse.json(
        { error: 'Concept not found' },
        { status: 404 }
      );
    }

    // Generate learning content (same as regular users)
    const content = await generateLearningContent(concept);

    return NextResponse.json({
      content,
      concept: {
        id: concept.id,
        title: concept.title,
        description: concept.description,
      },
      isGuest: true,
    });
  } catch (error) {
    console.error('Guest learning content error:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning content' },
      { status: 500 }
    );
  }
}

