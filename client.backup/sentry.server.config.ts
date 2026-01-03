// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Performance monitoring
  integrations: [
    Sentry.httpIntegration(),
  ],

  // Set tags to distinguish client portal
  initialScope: {
    tags: {
      app: 'client',
      site: 'client.currentmesh.com',
      platform: 'nextjs',
      runtime: 'server',
    },
  },

  // Filter out non-critical errors
  beforeSend(event, hint) {
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore known non-critical errors
        if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
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
Sentry.setTag('runtime', 'server');

