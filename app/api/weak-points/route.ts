/**
 * Weak Points API
 * 
 * POST /api/weak-points
 * 
 * Detects weak points from error patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectWeakPoints, shouldTriggerRemediation } from '@/lib/services/weak-points/detector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conceptId, errorPatterns, attempts } = body;

    if (!conceptId || !errorPatterns || !Array.isArray(errorPatterns)) {
      return NextResponse.json(
        { error: 'Invalid request: conceptId and errorPatterns array required' },
        { status: 400 }
      );
    }

    const weakPoint = await detectWeakPoints(conceptId, errorPatterns, attempts || errorPatterns.length);

    if (!weakPoint) {
      return NextResponse.json({
        detected: false,
        message: 'No weak points detected yet',
      });
    }

    const needsRemediation = shouldTriggerRemediation(weakPoint);

    return NextResponse.json({
      detected: true,
      weakPoint,
      needsRemediation,
    });
  } catch (error) {
    console.error('Weak point detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect weak points' },
      { status: 500 }
    );
  }
}

