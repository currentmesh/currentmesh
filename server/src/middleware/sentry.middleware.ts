import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { config } from '../config/env';

/**
 * Sentry middleware for enhanced error tracking
 */

// Set user context from JWT token
export function setSentryUser(req: Request, res: Response, next: NextFunction): void {
  if (!config.sentry.dsn) {
    return next();
  }

  try {
    // Extract user from JWT (if authenticated)
    const user = (req as any).user; // Will be set by auth middleware

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
        organizationId: user.organizationId,
      });
    }

    // Set custom tags
    const requestId = req.headers['x-request-id'];
    Sentry.setTag('request_id', Array.isArray(requestId) ? requestId[0] : requestId || 'unknown');
    Sentry.setTag('method', req.method);
    Sentry.setTag('path', req.path);
    Sentry.setTag('ip', req.ip || 'unknown');

    // Set custom context
    Sentry.setContext('request', {
      url: req.url,
      method: req.method,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer'],
      },
      query: req.query,
      body: sanitizeBody(req.body), // Remove sensitive data
    });
  } catch (error) {
    // Don't let Sentry errors break the request
    console.error('Sentry middleware error:', error);
  }

  next();
}

// Add breadcrumb for API requests
export function addRequestBreadcrumb(req: Request, res: Response, next: NextFunction): void {
  if (!config.sentry.dsn) {
    return next();
  }

  try {
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${req.method} ${req.path}`,
      level: 'info',
      data: {
        method: req.method,
        path: req.path,
        status_code: res.statusCode,
      },
    });
  } catch (error) {
    // Don't let Sentry errors break the request
    console.error('Sentry breadcrumb error:', error);
  }

  next();
}

// Track performance for API routes
// Note: Performance tracking is handled automatically by Sentry's httpIntegration
// This function is kept for custom tracking if needed
export function trackPerformance(routeName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!config.sentry.dsn) {
      return next();
    }

    // Sentry automatically tracks HTTP requests via httpIntegration
    // For custom spans, use Sentry.startSpan() instead
    Sentry.startSpan(
      {
        op: 'http.server',
        name: routeName,
        attributes: {
          'http.method': req.method,
          'http.path': req.path,
        },
      },
      (span) => {
        res.on('finish', () => {
          if (span) {
            span.setAttribute('http.status_code', res.statusCode);
          }
        });
        next();
      }
    );
  };
}

// Sanitize request body to remove sensitive data
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'ssn', 'creditCard'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

