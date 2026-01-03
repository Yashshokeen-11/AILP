/**
 * Authentication Utilities
 */

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

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
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
  });
  return sessionId;
}

export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Simple in-memory session store (in production, use Redis or database)
const sessionStore = new Map<string, { userId: string; expiresAt: number }>();

export function setSessionData(sessionId: string, userId: string): void {
  sessionStore.set(sessionId, {
    userId,
    expiresAt: Date.now() + SESSION_DURATION,
  });
}

export function getSessionData(sessionId: string): { userId: string } | null {
  const data = sessionStore.get(sessionId);
  if (!data || data.expiresAt < Date.now()) {
    sessionStore.delete(sessionId);
    return null;
  }
  return { userId: data.userId };
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of sessionStore.entries()) {
    if (data.expiresAt < now) {
      sessionStore.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Every hour

