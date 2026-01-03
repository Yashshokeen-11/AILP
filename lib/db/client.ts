/**
 * Database Client
 * 
 * Sets up the database connection using Drizzle ORM with proper connection pooling.
 * Configured for Supabase free tier with limited connection slots.
 * Uses singleton pattern to ensure only one connection pool exists.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection string from environment
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('DATABASE_URL not set. Database operations will fail.');
}

// Use global singleton to prevent multiple connection pools in Next.js serverless functions
declare global {
  // eslint-disable-next-line no-var
  var postgresClient: ReturnType<typeof postgres> | undefined;
}

// Create or reuse postgres client with connection pooling configuration
// Supabase free tier has limited connection slots, so we use conservative settings
const client = globalThis.postgresClient ?? postgres(connectionString, {
  max: 1, // Maximum 1 connection per instance (Supabase free tier limit)
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout of 10 seconds
  prepare: false, // Disable prepared statements to reduce connection overhead
});

// Store client in global for reuse in Next.js serverless functions
if (process.env.NODE_ENV !== 'production') {
  globalThis.postgresClient = client;
}

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export { schema };

