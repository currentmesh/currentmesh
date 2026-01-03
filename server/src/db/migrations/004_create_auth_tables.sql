-- Migration: Create authentication and session tables
-- Date: 2025-01-01
-- Purpose: Authentication tokens and session management

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Client portal sessions table
CREATE TABLE client_portal_sessions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_portal_sessions_client_id ON client_portal_sessions(client_id);
CREATE INDEX idx_client_portal_sessions_organization_id ON client_portal_sessions(organization_id);
CREATE INDEX idx_client_portal_sessions_token ON client_portal_sessions(session_token);
CREATE INDEX idx_client_portal_sessions_expires_at ON client_portal_sessions(expires_at);

-- Client magic link tokens table
CREATE TABLE client_magic_link_tokens (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_client_magic_link_tokens_client_id ON client_magic_link_tokens(client_id);
CREATE INDEX idx_client_magic_link_tokens_organization_id ON client_magic_link_tokens(organization_id);
CREATE INDEX idx_client_magic_link_tokens_token ON client_magic_link_tokens(token);
CREATE INDEX idx_client_magic_link_tokens_expires_at ON client_magic_link_tokens(expires_at);

-- Add comments
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for user authentication.';
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens with expiration.';
COMMENT ON TABLE client_portal_sessions IS 'Client portal session tokens with organization_id for multi-tenant isolation.';
COMMENT ON TABLE client_magic_link_tokens IS 'Magic link tokens for client portal authentication with organization_id.';


