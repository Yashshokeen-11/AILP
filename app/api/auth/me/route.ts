/**
 * Get Current User API Route
 */

import { NextResponse } from 'next/server';
import { getSession, getSessionData } from '@/lib/auth/utils';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sessionData = getSessionData(sessionId);
    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
    }).from(users).where(eq(users.id, sessionData.userId)).limit(1);

    if (!user[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: user[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

