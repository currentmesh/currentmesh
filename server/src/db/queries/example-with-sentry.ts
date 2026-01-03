import { getPool } from '../../config/database';
import { trackDatabaseQuery } from '../../utils/sentry-helpers';
import * as Sentry from '@sentry/node';

/**
 * Example database query with Sentry tracking
 * This shows how to track database queries for performance monitoring
 */

export async function getRequestById(requestId: string, organizationId: string) {
  return trackDatabaseQuery('getRequestById', async () => {
    const pool = getPool();
    
    const result = await pool.query(
      `SELECT * FROM requests 
       WHERE id = $1 AND organization_id = $2`,
      [requestId, organizationId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Request not found');
      Sentry.captureException(error, {
        tags: {
          request_id: requestId,
          organization_id: organizationId,
          error_type: 'not_found',
        },
      });
      throw error;
    }

    return result.rows[0];
  });
}

/**
 * Example with custom span for complex queries
 */
export async function getRequestsWithFilters(filters: {
  organizationId: string;
  status?: string;
  limit?: number;
}) {
  return Sentry.startSpan(
    {
      op: 'db.query',
      name: 'getRequestsWithFilters',
    },
    async (span) => {
      try {
        const pool = getPool();
        let query = 'SELECT * FROM requests WHERE organization_id = $1';
        const params: any[] = [filters.organizationId];
        let paramIndex = 2;

        if (filters.status) {
          query += ` AND status = $${paramIndex}`;
          params.push(filters.status);
          paramIndex++;
        }

        query += ' ORDER BY created_at DESC';

        if (filters.limit) {
          query += ` LIMIT $${paramIndex}`;
          params.push(filters.limit);
        }

        const result = await pool.query(query, params);

        span?.setAttribute('db.row_count', result.rows.length);
        span?.setStatus({ code: 1, message: 'ok' });

        return result.rows;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        Sentry.captureException(error as Error, {
          tags: {
            query: 'getRequestsWithFilters',
            error_type: 'database_error',
          },
          contexts: {
            filters,
          },
        });
        throw error;
      }
    }
  );
}

