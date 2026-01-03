-- Create table for storing Sentry errors
CREATE TABLE IF NOT EXISTS sentry_errors (
  id SERIAL PRIMARY KEY,
  sentry_id VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  level VARCHAR(50) NOT NULL,
  url TEXT,
  environment VARCHAR(50),
  tags JSONB,
  metadata JSONB,
  timestamp TIMESTAMP,
  project VARCHAR(255),
  raw_data JSONB,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sentry_errors_sentry_id ON sentry_errors(sentry_id);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_resolved_at ON sentry_errors(resolved_at);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_created_at ON sentry_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_level ON sentry_errors(level);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_project ON sentry_errors(project);
CREATE INDEX IF NOT EXISTS idx_sentry_errors_tags_app ON sentry_errors USING GIN (tags jsonb_path_ops);

-- Add comment
COMMENT ON TABLE sentry_errors IS 'Stores errors received from Sentry webhooks for agent access';

