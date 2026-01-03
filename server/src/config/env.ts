import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Environment variable schema
const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),

  // File Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Email
  SENDGRID_API_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5000'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
  },
  sentry: {
    dsn: env.SENTRY_DSN || '',
  },
  storage: {
    s3: {
      bucket: env.S3_BUCKET,
      region: env.S3_REGION,
      accessKey: env.S3_ACCESS_KEY,
      secretKey: env.S3_SECRET_KEY,
    },
  },
  email: {
    sendgridApiKey: env.SENDGRID_API_KEY,
  },
  cors: {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  },
};

