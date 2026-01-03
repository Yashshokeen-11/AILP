/**
 * Server-side utility to get current user
 */

import { getSession, getSessionData } from './utils';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getCurrentUser() {
  try {
    const sessionId = await getSession();
    if (!sessionId) {
      return null;
    }

    const sessionData = getSessionData(sessionId);
    if (!sessionData) {
      return null;
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
    }).from(users).where(eq(users.id, sessionData.userId)).limit(1);

    return user[0] || null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

