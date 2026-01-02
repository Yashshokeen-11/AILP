/**
 * Database Client
 * 
 * Sets up the database connection using Drizzle ORM.
 * Supports both PostgreSQL (production) and SQLite (development/MVP).
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Database connection string from environment
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.warn('DATABASE_URL not set. Database operations will fail.');
}

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other files
export { schema };

