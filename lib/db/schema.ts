/**
 * Database Schema
 * 
 * Uses Drizzle ORM for type-safe database operations.
 * Defines all tables for learner progress tracking.
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  timestamp, 
  decimal, 
  integer, 
  boolean, 
  text, 
  jsonb 
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (simple email-based auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Sessions table - stores user sessions
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learner profiles - tracks overall progress
export const learnerProfiles = pgTable('learner_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  subject: varchar('subject', { length: 50 }).notNull().default('python'),
  overallConfidence: decimal('overall_confidence', { precision: 3, scale: 2 }).default('0.00'),
  totalConceptsLearned: integer('total_concepts_learned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Concept mastery - tracks knowledge state per concept
export const conceptMastery = pgTable('concept_mastery', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerProfileId: uuid('learner_profile_id').references(() => learnerProfiles.id, { onDelete: 'cascade' }).notNull(),
  conceptId: varchar('concept_id', { length: 100 }).notNull(),
  masteryScore: decimal('mastery_score', { precision: 3, scale: 2 }).default('0.00'), // 0.00 to 1.00
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }).default('0.00'), // 0.00 to 1.00
  status: varchar('status', { length: 20 }).default('locked'), // locked, available, in_progress, completed
  attempts: integer('attempts').default(0),
  lastAttemptedAt: timestamp('last_attempted_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Learning sessions - tracks individual learning sessions
export const learningSessions = pgTable('learning_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerProfileId: uuid('learner_profile_id').references(() => learnerProfiles.id, { onDelete: 'cascade' }).notNull(),
  conceptId: varchar('concept_id', { length: 100 }).notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  timeSpentMinutes: integer('time_spent_minutes'),
  sectionsCompleted: integer('sections_completed').default(0),
  totalSections: integer('total_sections').notNull(),
});

// Assessment responses - stores diagnostic answers
export const assessmentResponses = pgTable('assessment_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerProfileId: uuid('learner_profile_id').references(() => learnerProfiles.id, { onDelete: 'cascade' }).notNull(),
  questionId: varchar('question_id', { length: 100 }).notNull(),
  responseText: text('response_text').notNull(),
  analyzedWeaknesses: jsonb('analyzed_weaknesses'), // LLM analysis results
  createdAt: timestamp('created_at').defaultNow(),
});

// Weak point records - tracks detected weaknesses
export const weakPoints = pgTable('weak_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerProfileId: uuid('learner_profile_id').references(() => learnerProfiles.id, { onDelete: 'cascade' }).notNull(),
  conceptId: varchar('concept_id', { length: 100 }).notNull(),
  weaknessType: varchar('weakness_type', { length: 50 }).notNull(), // conceptual, foundational, application
  severity: decimal('severity', { precision: 3, scale: 2 }).default('0.50'), // 0.00 to 1.00
  detectedAt: timestamp('detected_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
  errorPatterns: jsonb('error_patterns'), // Store patterns of errors
  remediationTriggered: boolean('remediation_triggered').default(false),
});

// Learning checkpoints - tracks checkpoint responses
export const checkpointResponses = pgTable('checkpoint_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  learningSessionId: uuid('learning_session_id').references(() => learningSessions.id, { onDelete: 'cascade' }).notNull(),
  checkpointIndex: integer('checkpoint_index').notNull(),
  responseText: text('response_text'),
  understandingScore: decimal('understanding_score', { precision: 3, scale: 2 }),
  feedbackGiven: text('feedback_given'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for type-safe queries
export const learnerProfilesRelations = relations(learnerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [learnerProfiles.userId],
    references: [users.id],
  }),
  conceptMasteries: many(conceptMastery),
  learningSessions: many(learningSessions),
  weakPoints: many(weakPoints),
  assessmentResponses: many(assessmentResponses),
}));

export const conceptMasteryRelations = relations(conceptMastery, ({ one }) => ({
  learnerProfile: one(learnerProfiles, {
    fields: [conceptMastery.learnerProfileId],
    references: [learnerProfiles.id],
  }),
}));

export const learningSessionsRelations = relations(learningSessions, ({ one, many }) => ({
  learnerProfile: one(learnerProfiles, {
    fields: [learningSessions.learnerProfileId],
    references: [learnerProfiles.id],
  }),
  checkpointResponses: many(checkpointResponses),
}));

