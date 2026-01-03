/**
 * Logout API Route
 */

import { NextResponse } from 'next/server';
import { deleteSession, getSession, getSessionData } from '@/lib/auth/utils';

export async function POST() {
  try {
    const sessionId = await getSession();
    if (sessionId) {
      const sessionData = getSessionData(sessionId);
      if (sessionData) {
        // In production, invalidate session in database/Redis
      }
    }
    await deleteSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

