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
      console.log('No session ID found');
      return null;
    }

    const sessionData = await getSessionData(sessionId);
    if (!sessionData) {
      console.log('No session data found for session ID:', sessionId.substring(0, 20) + '...');
      return null;
    }

    const user = await db.select({
      id: users.id,
      email: users.email,
    }).from(users).where(eq(users.id, sessionData.userId)).limit(1);

    if (!user[0]) {
      console.log('User not found for userId:', sessionData.userId);
      return null;
    }

    return user[0];
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

