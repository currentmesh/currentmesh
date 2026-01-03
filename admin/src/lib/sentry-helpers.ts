import * as Sentry from '@sentry/react';

/**
 * Sentry helper functions for frontend
 */

/**
 * Set user context
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
  organizationId?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    organizationId: user.organizationId,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for user actions
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
 * Track navigation
 */
export function trackNavigation(path: string): void {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated to ${path}`,
    level: 'info',
    data: { path },
  });
}

/**
 * Track API calls
 */
export function trackAPICall(
  method: string,
  url: string,
  statusCode?: number
): void {
  Sentry.addBreadcrumb({
    category: 'http',
    message: `${method} ${url}`,
    level: statusCode && statusCode >= 400 ? 'error' : 'info',
    data: {
      method,
      url,
      status_code: statusCode,
    },
  });
}

/**
 * Track user actions
 */
export function trackUserAction(
  action: string,
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    category: 'user',
    message: action,
    level: 'info',
    data,
  });
}

/**
 * Capture error with context
 */
export function captureError(
  error: Error,
  context?: Record<string, any>
): void {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

