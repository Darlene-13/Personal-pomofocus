import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }  // Add this line
});

export const db = drizzle(pool, { schema });