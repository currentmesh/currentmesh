import { Express } from 'express';
import * as Sentry from '@sentry/node';
import sentryWebhookRouter from './sentry-webhook';
import agentErrorsRouter from './agent-errors';
import adminRouter from './admin';
import authRouter from './auth';

export function setupRoutes(app: Express): void {
  // Root route - API information
  app.get('/', (req, res) => {
    res.json({
      message: 'CurrentMesh API',
      version: '1.0.0',
      status: 'online',
      documentation: 'https://api.currentmesh.com/api',
      endpoints: {
        health: '/health',
        api: '/api',
        ready: '/ready',
        live: '/live',
        'sentry-webhook': '/api/sentry/webhook',
        'agent-errors': '/api/agent/errors',
        auth: '/api/auth',
        admin: '/api/admin',
      },
    });
  });

  // Health check with database connectivity
  app.get('/health', async (req, res) => {
    try {
      const { getPool } = await import('../config/database');
      const pool = getPool();
      
      // Test database connection
      const dbStart = Date.now();
      await pool.query('SELECT 1');
      const dbTime = Date.now() - dbStart;
      
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          responseTime: `${dbTime}ms`
        },
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy',
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Readiness probe (for Kubernetes/PM2)
  app.get('/ready', async (req, res) => {
    try {
      const { getPool } = await import('../config/database');
      const pool = getPool();
      await pool.query('SELECT 1');
      res.json({ ready: true, timestamp: new Date().toISOString() });
    } catch (error) {
      res.status(503).json({ ready: false, error: 'Service not ready' });
    }
  });

  // Liveness probe
  app.get('/live', (req, res) => {
    res.json({ alive: true, timestamp: new Date().toISOString() });
  });

  // API routes
  app.get('/api', (req, res) => {
    res.json({
      message: 'CurrentMesh API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api',
        'sentry-webhook': '/api/sentry/webhook',
        'agent-errors': '/api/agent/errors',
      },
    });
  });

  // Authentication routes (public)
  app.use('/api/auth', authRouter);

  // Sentry webhook receiver
  app.use('/api', sentryWebhookRouter);

  // Agent error query endpoints
  app.use('/api', agentErrorsRouter);

  // Admin routes (requires super_admin authentication)
  app.use('/api/admin', adminRouter);

  // Test Sentry endpoint (remove in production)
  app.get('/api/test-sentry', (req, res) => {
    try {
      // Test error capture
      throw new Error('Test error from CurrentMesh backend - Sentry is working!');
    } catch (error) {
      Sentry.captureException(error);
      res.status(500).json({
        message: 'Test error sent to Sentry',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // TODO: Add route modules
  // app.use('/api/auth', authRoutes);
  // app.use('/api/requests', requestRoutes);
  // app.use('/api/workpapers', workpaperRoutes);
  // app.use('/api/documents', documentRoutes);
}

