import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../../config/database';
import { logger } from '../../utils/logger';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run database migrations in order
 */
export async function runMigrations(): Promise<void> {
  const pool = getPool();

  try {
    // Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get all SQL migration files, sorted by name
    const migrationFiles = readdirSync(__dirname)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      // Check if migration already ran
      const checkResult = await pool.query(
        'SELECT id FROM schema_migrations WHERE migration_name = $1',
        [file]
      );

      if (checkResult.rows.length > 0) {
        logger.info(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      try {
        // Read and execute migration file
        const migrationSQL = readFileSync(join(__dirname, file), 'utf-8');
        await pool.query(migrationSQL);

        // Record migration as executed
        await pool.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [file]
        );

        logger.info(`✅ Migration completed: ${file}`);
      } catch (error: any) {
        // Table might already exist, that's okay
        if (error.code === '42P07') {
          logger.info(`ℹ️  ${file} - tables already exist, marking as executed`);
          await pool.query(
            'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
            [file]
          );
        } else {
          logger.error(`❌ Migration failed: ${file}`, error);
          throw error;
        }
      }
    }

    logger.info('✅ All migrations completed');
  } catch (error) {
    logger.error('❌ Migration process failed:', error);
    throw error;
  }
}

