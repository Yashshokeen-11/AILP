/**
 * Guest Roadmap API Route
 * Returns a roadmap for guest users using localStorage data
 */

import { NextResponse } from 'next/server';
import { PYTHON_KNOWLEDGE_GRAPH } from '@/lib/knowledge-graph/python-graph';
import { ConceptStatus } from '@/lib/knowledge-graph/types';

export async function GET() {
  try {
    // For guest users, return a default roadmap with all concepts available
    // The client-side will use localStorage to track progress
    const roadmap = PYTHON_KNOWLEDGE_GRAPH.map(concept => {
      // All concepts start as 'available' for guests
      let status: ConceptStatus = 'available';
      
      // If concept has prerequisites, mark as locked initially
      if (concept.prerequisites.length > 0) {
        status = 'locked';
      }

      return {
        id: concept.id,
        title: concept.title,
        description: concept.description,
        level: concept.level,
        prerequisites: concept.prerequisites, // Include prerequisites
        status,
        masteryScore: 0,
        confidenceScore: 0,
      };
    });

    // Calculate progress (will be updated by client based on localStorage)
    const completedCount = 0;
    const progressPercent = 0;

    return NextResponse.json({
      roadmap,
      progress: {
        completed: completedCount,
        total: roadmap.length,
        percent: progressPercent,
      },
      isGuest: true,
    });
  } catch (error) {
    console.error('Guest roadmap error:', error);
    return NextResponse.json(
      { error: 'Failed to get roadmap' },
      { status: 500 }
    );
  }
}

