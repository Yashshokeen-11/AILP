/**
 * Assessment Analysis API
 * 
 * POST /api/assessment/analyze
 * 
 * Analyzes assessment responses and returns initial learner profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeAssessment, AssessmentResponse } from '@/lib/services/assessment/analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { responses } = body as { responses: AssessmentResponse[] };

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: responses array required' },
        { status: 400 }
      );
    }

    // Analyze responses
    const analysis = await analyzeAssessment(responses);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Assessment analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze assessment' },
      { status: 500 }
    );
  }
}

