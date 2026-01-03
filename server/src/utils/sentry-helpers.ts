import * as Sentry from '@sentry/node';

/**
 * Helper functions for Sentry integration
 */

/**
 * Track database query performance
 */
export function trackDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      op: 'db.query',
      name: queryName,
    },
    async (span) => {
      try {
        const result = await queryFn();
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        throw error;
      }
    }
  );
}

/**
 * Track external API calls
 */
export function trackExternalAPI<T>(
  apiName: string,
  apiFn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      op: 'http.client',
      name: apiName,
    },
    async (span) => {
      try {
        const result = await apiFn();
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        Sentry.captureException(error, {
          tags: {
            api_name: apiName,
            error_type: 'external_api',
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Track file operations
 */
export function trackFileOperation<T>(
  operation: string,
  fileFn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      op: 'file.operation',
      name: operation,
    },
    async (span) => {
      try {
        const result = await fileFn();
        span?.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: 'internal_error' });
        Sentry.captureException(error, {
          tags: {
            operation,
            error_type: 'file_operation',
          },
        });
        throw error;
      }
    }
  );
}

/**
 * Add custom breadcrumb
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set custom tags
 */
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>): void {
  Sentry.setContext(name, context);
}

/**
 * Capture message with context
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

