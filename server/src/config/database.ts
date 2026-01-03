import { Pool } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

export async function setupDatabase(): Promise<void> {
  if (pool) {
    return; // Already initialized
  }

  pool = new Pool({
    connectionString: config.database.url,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Increased from 2000ms to 10000ms for stability
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    logger.error('Unexpected database pool error:', err);
    // Don't throw - let connection retry logic handle it
  });

  // Test connection
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('Database connected:', result.rows[0].now);
    client.release();
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call setupDatabase() first.');
  }
  return pool;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
}

