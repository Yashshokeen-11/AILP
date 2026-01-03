-- Cleanup script to drop all existing tables
-- Run this in your Supabase SQL Editor or via psql

DROP TABLE IF EXISTS "checkpoint_responses" CASCADE;
DROP TABLE IF EXISTS "weak_points" CASCADE;
DROP TABLE IF EXISTS "assessment_responses" CASCADE;
DROP TABLE IF EXISTS "learning_sessions" CASCADE;
DROP TABLE IF EXISTS "concept_mastery" CASCADE;
DROP TABLE IF EXISTS "learner_profiles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Also drop any old tables that might exist
DROP TABLE IF EXISTS "subjects" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "session_messages" CASCADE;
DROP TABLE IF EXISTS "assessments" CASCADE;
DROP TABLE IF EXISTS "questions" CASCADE;
DROP TABLE IF EXISTS "reflections" CASCADE;
DROP TABLE IF EXISTS "concepts" CASCADE;
DROP TABLE IF EXISTS "notes" CASCADE;
DROP TABLE IF EXISTS "concept_prerequisites" CASCADE;

