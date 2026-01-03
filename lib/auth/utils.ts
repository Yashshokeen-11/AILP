/**
 * Authentication Utilities
 */

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/client';
import { sessions } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

const SESSION_COOKIE_NAME = 'ailp_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  // Store session in database
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });
  
  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/', // Ensure cookie is available for all routes
  });
  
  console.log('Session created in database:', { sessionId: sessionId.substring(0, 20) + '...', userId });
  return sessionId;
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

export async function deleteSession(): Promise<void> {
  const sessionId = await getSession();
  if (sessionId) {
    // Delete from database
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }
  // Delete cookie
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionData(sessionId: string): Promise<{ userId: string } | null> {
  try {
    // Get session from database
    const sessionRecords = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);
    
    if (sessionRecords.length === 0) {
      console.log('Session not found or expired in database:', sessionId.substring(0, 20) + '...');
      return null;
    }
    
    const session = sessionRecords[0];
    return { userId: session.userId };
  } catch (error) {
    console.error('Error getting session data:', error);
    return null;
  }
}

