import { Express, Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { logger } from '../utils/logger';
import { config } from '../config/env';

export function setupErrorHandling(app: Express): void {
  // Sentry error handler (must be before other error handlers)
  if (config.sentry.dsn) {
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      Sentry.captureException(err);
      next(err);
    });
  }

  // 404 handler (only runs if no route matches)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Only handle 404 if this is not an error
    if (!res.headersSent) {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    } else {
      next();
    }
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
  });
}

