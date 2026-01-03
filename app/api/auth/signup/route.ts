/**
 * Signup API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, getUserByEmail } from '@/lib/db/queries';
import { hashPassword, createSession, setSessionData } from '@/lib/auth/utils';
import { createLearnerProfile } from '@/lib/db/queries';
import { PYTHON_KNOWLEDGE_GRAPH } from '@/lib/knowledge-graph/python-graph';
import { initializeConceptMasteries } from '@/lib/db/queries';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);

    // Create learner profile
    const profile = await createLearnerProfile(user.id, 'python');

    // Initialize concept masteries
    await initializeConceptMasteries(profile.id, PYTHON_KNOWLEDGE_GRAPH);

    // Create session
    const sessionId = await createSession(user.id);
    setSessionData(sessionId, user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

