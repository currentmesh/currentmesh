// This file configures the initialization of Sentry for edge features (middleware, edge routes, etc.)
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unstable until https://github.com/getsentry/sentry-javascript/issues/7977 is fixed.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: 1.0,
  
  // Set tags to distinguish client portal
  initialScope: {
    tags: {
      app: 'client',
      site: 'client.currentmesh.com',
      platform: 'nextjs',
      runtime: 'edge',
    },
  },
});


