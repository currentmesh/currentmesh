import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG || '4510628533370880',
  project: process.env.SENTRY_PROJECT || '4510628587634688',
  
  // Only upload source maps in production
  dryRun: process.env.NODE_ENV !== 'production',
}

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
