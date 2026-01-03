/**
 * Roadmap API Route
 * Returns the learner's current roadmap with concept statuses
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getOrCreateLearnerProfile, getAllConceptMasteries } from '@/lib/db/queries';
import { PYTHON_KNOWLEDGE_GRAPH } from '@/lib/knowledge-graph/python-graph';
import { ConceptStatus } from '@/lib/knowledge-graph/types';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const profile = await getOrCreateLearnerProfile(user.id, 'python');
    const masteries = await getAllConceptMasteries(profile.id);

    // Create a map of concept masteries
    const masteryMap = new Map(
      masteries.map(m => [m.conceptId, m])
    );

    // Build roadmap with statuses
    const roadmap = PYTHON_KNOWLEDGE_GRAPH.map(concept => {
      const mastery = masteryMap.get(concept.id);
      let status: ConceptStatus = 'locked';

      if (mastery) {
        status = mastery.status as ConceptStatus;
      } else {
        // Determine initial status based on prerequisites
        const completedIds = masteries
          .filter(m => m.status === 'completed')
          .map(m => m.conceptId);
        
        const allPrereqsMet = concept.prerequisites.every(prereq =>
          completedIds.includes(prereq)
        );
        
        if (concept.prerequisites.length === 0 || allPrereqsMet) {
          status = 'available';
        }
      }

      return {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        level: concept.level,
        status,
        masteryScore: mastery ? parseFloat(mastery.masteryScore || '0') : 0,
        confidenceScore: mastery ? parseFloat(mastery.confidenceScore || '0') : 0,
      };
    });

    // Calculate overall progress
    const completedCount = roadmap.filter(c => c.status === 'completed').length;
    const progressPercent = (completedCount / roadmap.length) * 100;

    return NextResponse.json({
      roadmap,
      progress: {
        completed: completedCount,
        total: roadmap.length,
        percent: Math.round(progressPercent),
      },
    });
  } catch (error) {
    console.error('Roadmap error:', error);
    return NextResponse.json(
      { error: 'Failed to get roadmap' },
      { status: 500 }
    );
  }
}

