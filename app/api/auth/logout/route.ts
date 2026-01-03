/**
 * Logout API Route
 */

import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/utils';

export async function POST() {
  try {
    // deleteSession now handles both database deletion and cookie deletion
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

