// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  replaysOnErrorSampleRate: 1.0,
  
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  
  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
    // Capture console logs
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
    // Performance monitoring
    Sentry.browserTracingIntegration({
      enableInp: true, // Track Interaction to Next Paint
    }),
  ],

  // Set tags to distinguish client portal
  initialScope: {
    tags: {
      app: 'client',
      site: 'client.currentmesh.com',
      platform: 'nextjs',
    },
  },

  // Filter out non-critical errors
  beforeSend(event, hint) {
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore network errors
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          return null;
        }
      }
    }
    return event;
  },

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
});

// Set tags after initialization
Sentry.setTag('app', 'client');
Sentry.setTag('site', 'client.currentmesh.com');
Sentry.setTag('platform', 'nextjs');


