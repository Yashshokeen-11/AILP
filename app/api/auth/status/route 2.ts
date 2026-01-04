/**
 * Get User Status API Route
 * Returns whether user has completed assessment and where they should be redirected
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/get-user';
import { getOrCreateLearnerProfile } from '@/lib/db/queries';
import { db } from '@/lib/db/client';
import { assessmentResponses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get learner profile
    const profile = await getOrCreateLearnerProfile(user.id, 'python');

    // Check if assessment has been completed (has at least 3 responses)
    const responses = await db.select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.learnerProfileId, profile.id));

    const hasCompletedAssessment = responses.length >= 3;

    return NextResponse.json({
      hasCompletedAssessment,
      redirectTo: hasCompletedAssessment ? '/roadmap' : '/assessment',
    });
  } catch (error) {
    console.error('Get user status error:', error);
    return NextResponse.json(
      { error: 'Failed to get user status' },
      { status: 500 }
    );
  }
}

