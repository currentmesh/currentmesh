-- Migration: Create organizations table (multi-tenant foundation)
-- Date: 2025-01-01
-- Purpose: Foundation for multi-tenant architecture

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE, -- For future: {subdomain}.app.currentmesh.com
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for subdomain lookups
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);

-- Create index for status filtering
CREATE INDEX idx_organizations_status ON organizations(status);

-- Create default organization (CurrentMesh platform)
INSERT INTO organizations (id, name, subdomain, status, subscription_tier)
VALUES (1, 'CurrentMesh', 'default', 'active', 'enterprise');

-- Add comment
COMMENT ON TABLE organizations IS 'Multi-tenant organizations table. All tenant data references this table via organization_id.';


