/**
 * Checkpoint Analysis API
 * 
 * POST /api/learning/[conceptId]/checkpoint
 * 
 * Analyzes checkpoint response and provides feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeCheckpoint } from '@/lib/services/teaching/checkpoint-analyzer';

export async function POST(
  request: NextRequest,
  { params }: { params: { conceptId: string } }
) {
  try {
    const { conceptId } = params;
    const body = await request.json();
    const { question, response } = body;

    if (!question || !response) {
      return NextResponse.json(
        { error: 'Invalid request: question and response required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCheckpoint(question, response, conceptId);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Checkpoint analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze checkpoint' },
      { status: 500 }
    );
  }
}

