/**
 * Database Query Helpers
 * 
 * Type-safe database operations using Drizzle ORM
 */

import { eq, and, desc } from 'drizzle-orm';
import { db } from './client';
import {
  users,
  learnerProfiles,
  conceptMastery,
  learningSessions,
  assessmentResponses,
  weakPoints,
  checkpointResponses,
} from './schema';
import { Concept } from '@/lib/knowledge-graph/python-graph';

/**
 * User Operations
 */
export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function createUser(email: string, passwordHash: string) {
  const result = await db.insert(users).values({
    email,
    passwordHash,
  }).returning();
  return result[0];
}

/**
 * Learner Profile Operations
 */
export async function getLearnerProfile(userId: string, subject: string = 'python') {
  const result = await db.select()
    .from(learnerProfiles)
    .where(and(
      eq(learnerProfiles.userId, userId),
      eq(learnerProfiles.subject, subject)
    ))
    .limit(1);
  return result[0] || null;
}

export async function createLearnerProfile(userId: string, subject: string = 'python') {
  const result = await db.insert(learnerProfiles).values({
    userId,
    subject,
    overallConfidence: '0.00',
    totalConceptsLearned: 0,
  }).returning();
  return result[0];
}

export async function getOrCreateLearnerProfile(userId: string, subject: string = 'python') {
  let profile = await getLearnerProfile(userId, subject);
  if (!profile) {
    profile = await createLearnerProfile(userId, subject);
  }
  return profile;
}

/**
 * Concept Mastery Operations
 */
export async function getConceptMastery(learnerProfileId: string, conceptId: string) {
  const result = await db.select()
    .from(conceptMastery)
    .where(and(
      eq(conceptMastery.learnerProfileId, learnerProfileId),
      eq(conceptMastery.conceptId, conceptId)
    ))
    .limit(1);
  return result[0] || null;
}

export async function getAllConceptMasteries(learnerProfileId: string) {
  return await db.select()
    .from(conceptMastery)
    .where(eq(conceptMastery.learnerProfileId, learnerProfileId));
}

export async function updateConceptMastery(
  learnerProfileId: string,
  conceptId: string,
  updates: {
    masteryScore?: number;
    confidenceScore?: number;
    status?: 'locked' | 'available' | 'in_progress' | 'completed';
    attempts?: number;
  }
) {
  const existing = await getConceptMastery(learnerProfileId, conceptId);
  
  if (existing) {
    const result = await db.update(conceptMastery)
      .set({
        ...updates,
        masteryScore: updates.masteryScore?.toString(),
        confidenceScore: updates.confidenceScore?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(conceptMastery.id, existing.id))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(conceptMastery).values({
      learnerProfileId,
      conceptId,
      masteryScore: updates.masteryScore?.toString() || '0.00',
      confidenceScore: updates.confidenceScore?.toString() || '0.00',
      status: updates.status || 'locked',
      attempts: updates.attempts || 0,
    }).returning();
    return result[0];
  }
}

/**
 * Initialize concept masteries for a learner profile
 */
export async function initializeConceptMasteries(
  learnerProfileId: string,
  concepts: Concept[],
  completedConceptIds: string[] = []
) {
  const masteries = concepts.map(concept => ({
    learnerProfileId,
    conceptId: concept.id,
    status: (() => {
      if (completedConceptIds.includes(concept.id)) return 'completed';
      if (concept.prerequisites.length === 0) return 'available';
      const allPrereqsMet = concept.prerequisites.every(prereq => 
        completedConceptIds.includes(prereq)
      );
      return allPrereqsMet ? 'available' : 'locked';
    })() as 'locked' | 'available' | 'in_progress' | 'completed',
    masteryScore: completedConceptIds.includes(concept.id) ? '1.00' : '0.00',
    confidenceScore: completedConceptIds.includes(concept.id) ? '1.00' : '0.00',
    attempts: 0,
  }));

  // Insert all at once (Drizzle will handle conflicts if needed)
  for (const mastery of masteries) {
    await updateConceptMastery(learnerProfileId, mastery.conceptId, {
      status: mastery.status,
      masteryScore: parseFloat(mastery.masteryScore),
      confidenceScore: parseFloat(mastery.confidenceScore),
    });
  }
}

/**
 * Learning Session Operations
 */
export async function createLearningSession(
  learnerProfileId: string,
  conceptId: string,
  totalSections: number
) {
  const result = await db.insert(learningSessions).values({
    learnerProfileId,
    conceptId,
    totalSections,
    sectionsCompleted: 0,
  }).returning();
  return result[0];
}

export async function updateLearningSession(
  sessionId: string,
  updates: {
    sectionsCompleted?: number;
    completedAt?: Date;
    timeSpentMinutes?: number;
  }
) {
  const result = await db.update(learningSessions)
    .set(updates)
    .where(eq(learningSessions.id, sessionId))
    .returning();
  return result[0];
}

/**
 * Assessment Response Operations
 */
export async function saveAssessmentResponse(
  learnerProfileId: string,
  questionId: string,
  responseText: string,
  analyzedWeaknesses?: any
) {
  const result = await db.insert(assessmentResponses).values({
    learnerProfileId,
    questionId,
    responseText,
    analyzedWeaknesses,
  }).returning();
  return result[0];
}

/**
 * Weak Point Operations
 */
export async function createWeakPoint(
  learnerProfileId: string,
  conceptId: string,
  weaknessType: 'conceptual' | 'foundational' | 'application',
  severity: number,
  errorPatterns?: any
) {
  const result = await db.insert(weakPoints).values({
    learnerProfileId,
    conceptId,
    weaknessType,
    severity: severity.toString(),
    errorPatterns,
  }).returning();
  return result[0];
}

/**
 * Checkpoint Response Operations
 */
export async function saveCheckpointResponse(
  learningSessionId: string,
  checkpointIndex: number,
  responseText: string,
  understandingScore?: number,
  feedbackGiven?: string
) {
  const result = await db.insert(checkpointResponses).values({
    learningSessionId,
    checkpointIndex,
    responseText,
    understandingScore: understandingScore?.toString(),
    feedbackGiven,
  }).returning();
  return result[0];
}

