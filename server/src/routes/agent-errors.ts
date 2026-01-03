import { Router, Request, Response } from 'express';
import { getPool } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Agent Error Query Endpoint
 * Allows the AI agent to query recent Sentry errors
 */
router.get('/agent/errors', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string || 'unresolved';
    const app = req.query.app as string; // Filter by app tag

    let query = `
      SELECT 
        id,
        sentry_id,
        title,
        message,
        level,
        url,
        environment,
        tags,
        metadata,
        timestamp,
        project,
        created_at,
        updated_at
      FROM sentry_errors
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status === 'unresolved') {
      query += ` AND resolved_at IS NULL`;
    } else if (status === 'resolved') {
      query += ` AND resolved_at IS NOT NULL`;
    }

    if (app) {
      query += ` AND tags::jsonb->>'app' = $${paramIndex}`;
      params.push(app);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    const errors = result.rows.map((row) => ({
      id: row.id,
      sentry_id: row.sentry_id,
      title: row.title,
      message: row.message,
      level: row.level,
      url: row.url,
      environment: row.environment,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
      timestamp: row.timestamp,
      project: row.project,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    logger.info('Agent queried errors', { count: errors.length, filters: { status, app } });

    res.json({
      success: true,
      count: errors.length,
      errors,
    });
  } catch (error) {
    logger.error('Error querying errors for agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Mark error as resolved
 */
router.post('/agent/errors/:id/resolve', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const errorId = req.params.id;

    await pool.query(
      `UPDATE sentry_errors 
       SET resolved_at = NOW(), updated_at = NOW() 
       WHERE id = $1`,
      [errorId]
    );

    logger.info('Agent resolved error', { error_id: errorId });

    res.json({ success: true, message: 'Error marked as resolved' });
  } catch (error) {
    logger.error('Error resolving error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get error details
 */
router.get('/agent/errors/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    const errorId = req.params.id;

    const result = await pool.query(
      `SELECT * FROM sentry_errors WHERE id = $1`,
      [errorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Error not found' });
    }

    const error = result.rows[0];
    error.tags = typeof error.tags === 'string' ? JSON.parse(error.tags) : error.tags;
    error.metadata = typeof error.metadata === 'string' ? JSON.parse(error.metadata) : error.metadata;
    error.raw_data = typeof error.raw_data === 'string' ? JSON.parse(error.raw_data) : error.raw_data;

    res.json({ success: true, error });
  } catch (error) {
    logger.error('Error fetching error details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

