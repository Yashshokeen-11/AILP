/**
 * Roadmap API Route
 * 
 * GET /api/roadmap - Get personalized roadmap
 * POST /api/roadmap - Update roadmap after completing concept
 * 
 * Supports both authenticated (with database) and unauthenticated (with query params) modes
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateRoadmap, updateRoadmapAfterCompletion } from '@/lib/services/curriculum/generator';
import { ConceptConfidence } from '@/lib/services/assessment/analyzer';

// Try to import auth functions (may not exist if not implemented)
let getCurrentUser: any;
let getOrCreateLearnerProfile: any;
let getAllConceptMasteries: any;

try {
  const authModule = require('@/lib/auth/get-user');
  getCurrentUser = authModule.getCurrentUser;
} catch {
  // Auth not available
}

try {
  const dbModule = require('@/lib/db/queries');
  getOrCreateLearnerProfile = dbModule.getOrCreateLearnerProfile;
  getAllConceptMasteries = dbModule.getAllConceptMasteries;
} catch {
  // DB queries not available
}

// GET: Get current roadmap
export async function GET(request: NextRequest) {
  try {
    // Try authenticated mode first (if auth is available)
    if (getCurrentUser) {
      try {
        const user = await getCurrentUser();
        if (user && getOrCreateLearnerProfile) {
          const profile = await getOrCreateLearnerProfile(user.id, 'python');
          const masteries = await getAllConceptMasteries(profile.id);
          
          // Convert masteries to concept confidence format
          const conceptConfidence: ConceptConfidence = {};
          const completedIds: string[] = [];
          
          masteries.forEach((m: any) => {
            conceptConfidence[m.conceptId] = parseFloat(m.confidenceScore || '0');
            if (m.status === 'completed') {
              completedIds.push(m.conceptId);
            }
          });
          
          const roadmapData = generateRoadmap(conceptConfidence, completedIds);
          const completedCount = roadmapData.concepts.filter(c => c.status === 'completed').length;
          return NextResponse.json({
            roadmap: roadmapData.concepts,
            progress: {
              completed: completedCount,
              total: roadmapData.concepts.length,
              percent: Math.round(roadmapData.overallProgress),
            },
          });
        }
      } catch (error) {
        // Fall through to query param mode if auth fails
        console.log('Auth mode failed, using query params:', error);
      }
    }

    // Fallback: Query param mode (for development/testing)
    const searchParams = request.nextUrl.searchParams;
    const conceptConfidenceJson = searchParams.get('conceptConfidence');
    const completedIds = searchParams.get('completed')?.split(',') || [];

    let conceptConfidence: ConceptConfidence = {};
    
    if (conceptConfidenceJson) {
      try {
        conceptConfidence = JSON.parse(conceptConfidenceJson);
      } catch {
        // Invalid JSON, use empty
      }
    }

    const roadmapData = generateRoadmap(conceptConfidence, completedIds);
    const completedCount = roadmapData.concepts.filter(c => c.status === 'completed').length;
    return NextResponse.json({
      roadmap: roadmapData.concepts,
      progress: {
        completed: completedCount,
        total: roadmapData.concepts.length,
        percent: Math.round(roadmapData.overallProgress),
      },
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}

// POST: Update roadmap after completing a concept
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roadmap, completedConceptId, finalMastery, finalConfidence } = body;

    if (!roadmap || !completedConceptId) {
      return NextResponse.json(
        { error: 'Invalid request: roadmap and completedConceptId required' },
        { status: 400 }
      );
    }

    const updatedRoadmap = updateRoadmapAfterCompletion(
      roadmap,
      completedConceptId,
      finalMastery || 1.0,
      finalConfidence || 1.0
    );

    return NextResponse.json(updatedRoadmap);
  } catch (error) {
    console.error('Roadmap update error:', error);
    return NextResponse.json(
      { error: 'Failed to update roadmap' },
      { status: 500 }
    );
  }
}
