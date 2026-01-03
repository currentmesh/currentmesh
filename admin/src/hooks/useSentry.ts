import { useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { setSentryUser, trackUserAction, trackNavigation } from '../lib/sentry-helpers';

/**
 * Hook to initialize Sentry user context
 */
export function useSentryUser(user: {
  id: string;
  email?: string;
  username?: string;
  organizationId?: string;
} | null) {
  useEffect(() => {
    if (user) {
      setSentryUser(user);
    } else {
      Sentry.setUser(null);
    }
  }, [user]);
}

/**
 * Hook to track page views
 */
export function useSentryPageView(pathname: string) {
  useEffect(() => {
    trackNavigation(pathname);
    Sentry.setTag('page', pathname);
  }, [pathname]);
}

/**
 * Hook to track user actions
 */
export function useSentryAction() {
  return {
    trackAction: (action: string, data?: Record<string, any>) => {
      trackUserAction(action, data);
    },
    trackError: (error: Error, context?: Record<string, any>) => {
      Sentry.captureException(error, {
        contexts: context ? { custom: context } : undefined,
      });
    },
  };
}

