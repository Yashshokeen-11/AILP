/**
 * Cleanup Database Script
 * Drops all existing tables to allow fresh schema creation
 */

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL not set in environment variables');
  process.exit(1);
}

const sql = postgres(connectionString);

async function cleanup() {
  try {
    console.log('🧹 Cleaning up old tables...');
    
    // Drop tables in correct order (respecting foreign keys)
    await sql`
      DROP TABLE IF EXISTS "checkpoint_responses" CASCADE;
      DROP TABLE IF EXISTS "weak_points" CASCADE;
      DROP TABLE IF EXISTS "assessment_responses" CASCADE;
      DROP TABLE IF EXISTS "learning_sessions" CASCADE;
      DROP TABLE IF EXISTS "concept_mastery" CASCADE;
      DROP TABLE IF EXISTS "learner_profiles" CASCADE;
      DROP TABLE IF EXISTS "users" CASCADE;
      DROP TABLE IF EXISTS "subjects" CASCADE;
      DROP TABLE IF EXISTS "user_profiles" CASCADE;
      DROP TABLE IF EXISTS "session_messages" CASCADE;
      DROP TABLE IF EXISTS "assessments" CASCADE;
      DROP TABLE IF EXISTS "questions" CASCADE;
      DROP TABLE IF EXISTS "reflections" CASCADE;
      DROP TABLE IF EXISTS "concepts" CASCADE;
      DROP TABLE IF EXISTS "notes" CASCADE;
      DROP TABLE IF EXISTS "concept_prerequisites" CASCADE;
    `;
    
    console.log('✅ All old tables dropped successfully!');
    console.log('📝 Now run: npm run db:push');
    
  } catch (error) {
    console.error('❌ Error cleaning up database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

cleanup();

