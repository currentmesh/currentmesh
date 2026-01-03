import express, { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { config } from './config/env';
import { setupDatabase } from './config/database';
import { runMigrations } from './db/migrations/run-migrations';
import { setupMiddleware } from './middleware/index';
import { setupRoutes } from './routes/index';
import { setupErrorHandling } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Initialize Sentry BEFORE anything else
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration(),
    ],
    // Set tags to distinguish backend API
    initialScope: {
      tags: {
        app: 'backend',
        site: 'api.currentmesh.com',
        platform: 'nodejs',
        runtime: 'express',
      },
    },
    debug: false,
  });

  // Set tags after initialization
  Sentry.setTag('app', 'backend');
  Sentry.setTag('site', 'api.currentmesh.com');
  Sentry.setTag('platform', 'nodejs');
  Sentry.setTag('runtime', 'express');
}

const app = express();
const PORT = config.port || 3000;

// Trust proxy (required for Cloudflare and Nginx reverse proxy)
// This allows Express to trust X-Forwarded-* headers
app.set('trust proxy', true);

// Sentry will capture errors automatically via error middleware

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Sentry error handler will be added in error middleware

// Setup error handling
setupErrorHandling(app);

// Store server instance for graceful shutdown
let server: ReturnType<typeof app.listen> | null = null;

// Validate environment on startup
function validateEnvironment() {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  logger.info('Environment validation passed');
}

// Start server
async function startServer() {
  try {
    // Validate environment variables
    validateEnvironment();
    
    // Initialize database connection with retry logic
    let dbConnected = false;
    let retries = 0;
    const maxRetries = 5;
    
    while (!dbConnected && retries < maxRetries) {
      try {
        await setupDatabase();
        logger.info('Database connected successfully');
        dbConnected = true;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          logger.error(`Failed to connect to database after ${maxRetries} attempts:`, error);
          Sentry.captureException(error);
          process.exit(1);
        }
        const delay = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff, max 10s
        logger.warn(`Database connection failed (attempt ${retries}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Run migrations
    await runMigrations();
    logger.info('Migrations completed');

    // Start Express server
    server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api`);
      logger.info(`🔗 Sentry Webhook: http://localhost:${PORT}/api/sentry/webhook`);
      logger.info(`🔗 Agent Errors: http://localhost:${PORT}/api/agent/errors`);
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      Sentry.captureException(error);
      // Don't exit immediately - let PM2 handle restart
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    Sentry.captureException(error);
    // Exit with code 1 to trigger PM2 restart
    process.exit(1);
  }
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  // Close database connections
  try {
    const { closeDatabase } = await import('./config/database');
    await closeDatabase();
  } catch (error) {
    logger.error('Error closing database:', error);
  }

  // Give connections time to close
  setTimeout(() => {
    logger.info('Graceful shutdown complete');
    process.exit(0);
  }, 5000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections (log but don't exit immediately)
process.on('unhandledRejection', (error: unknown) => {
  logger.error('Unhandled Rejection:', error);
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  // Don't exit - let PM2 handle restart if needed
});

// Handle uncaught exceptions (log but don't exit immediately for non-fatal errors)
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  Sentry.captureException(error);
  
  // Only exit for critical errors
  if (error.message.includes('EADDRINUSE') || error.message.includes('port')) {
    logger.error('Port conflict detected, exiting for PM2 restart');
    process.exit(1);
  }
  // For other errors, log and continue (PM2 will restart if needed)
});

startServer();

