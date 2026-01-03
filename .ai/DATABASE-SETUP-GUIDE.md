# CurrentMesh Database Setup Guide

**Date**: 2025-01-01  
**Status**: Current Setup Documentation  
**Purpose**: Guide for configuring the 2-database architecture

---

## Current Database Setup

### ✅ Database 1: Application Database
**Connection**: `ep-spring-snow-af038yg8-pooler`  
**Environment Variable**: `DATABASE_URL`  
**Location**: `server/.env.local`  
**Used By**: 
- `server/` - Backend API
- `app/` - Main application (via API)
- `client/` - Client portal (via API)
- `admin/` - Super admin (via API)

**Purpose**: All tenant and platform data
- Organizations (multi-tenant)
- Users (with organization_id)
- Clients (with organization_id)
- Requests (with organization_id)
- Documents (with organization_id)
- Workpapers (with organization_id)
- All other tenant data

---

### ⚠️ Database 2: Marketing Database
**Connection**: (Your Neon marketing database)  
**Environment Variable**: `MARKETING_DATABASE_URL` (to be configured)  
**Location**: `marketing/.env.local` (to be configured)`  
**Used By**: 
- `marketing/` - Marketing site (Next.js)

**Purpose**: Public marketing content
- Blog posts
- CMS pages
- Testimonials
- Case studies
- Newsletter signups
- Page views/analytics

---

## Configuration Steps

### Step 1: Configure Marketing Database

Add to `marketing/.env.local`:

```bash
MARKETING_DATABASE_URL=postgresql://user:password@your-marketing-db-pooler.neon.tech/neondb?sslmode=require
```

### Step 2: Update Server Config for Dual Databases

Update `server/src/config/env.ts`:

```typescript
const envSchema = z.object({
  // ... existing fields ...
  
  // Databases
  DATABASE_URL: z.string().url(), // Application database
  MARKETING_DATABASE_URL: z.string().url().optional(), // Marketing database (if needed by server)
});
```

### Step 3: Create Database Connection Helpers

Create `server/src/config/databases.ts`:

```typescript
import { Pool } from 'pg';
import { config } from './env';

// Application database pool
let appPool: Pool | null = null;

// Marketing database pool (if needed)
let marketingPool: Pool | null = null;

export async function setupApplicationDatabase(): Promise<void> {
  if (appPool) return;
  
  appPool = new Pool({
    connectionString: config.database.url,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  // Test connection
  const client = await appPool.connect();
  await client.query('SELECT NOW()');
  client.release();
}

export function getApplicationPool(): Pool {
  if (!appPool) {
    throw new Error('Application database not initialized');
  }
  return appPool;
}

// Marketing database (if server needs to access it)
export async function setupMarketingDatabase(): Promise<void> {
  if (!config.marketingDatabase?.url) {
    return; // Marketing DB not configured
  }
  
  if (marketingPool) return;
  
  marketingPool = new Pool({
    connectionString: config.marketingDatabase.url,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  const client = await marketingPool.connect();
  await client.query('SELECT NOW()');
  client.release();
}

export function getMarketingPool(): Pool | null {
  return marketingPool;
}
```

---

## Multi-Tenant Schema Setup

### Step 1: Create Organizations Table

```sql
-- Run in application database (ep-spring-snow-af038yg8)
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE, -- For future: {subdomain}.app.currentmesh.com
  status VARCHAR(50) DEFAULT 'active',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create default organization (your organization)
INSERT INTO organizations (id, name, subdomain, status, subscription_tier)
VALUES (1, 'CurrentMesh', 'default', 'active', 'enterprise');
```

### Step 2: Add organization_id to Existing Tables

```sql
-- Add organization_id to users table
ALTER TABLE users 
ADD COLUMN organization_id INTEGER DEFAULT 1 REFERENCES organizations(id);

-- Add organization_id to clients table (if exists)
ALTER TABLE clients 
ADD COLUMN organization_id INTEGER DEFAULT 1 REFERENCES organizations(id);

-- Add organization_id to any other tenant tables
-- ALTER TABLE requests ADD COLUMN organization_id INTEGER DEFAULT 1 REFERENCES organizations(id);
-- ALTER TABLE documents ADD COLUMN organization_id INTEGER DEFAULT 1 REFERENCES organizations(id);
```

### Step 3: Create Indexes

```sql
-- Index for fast organization lookups
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
-- CREATE INDEX idx_requests_organization_id ON requests(organization_id);
-- CREATE INDEX idx_documents_organization_id ON documents(organization_id);
```

---

## Query Patterns

### Always Filter by organization_id

```typescript
// ✅ Correct: Always include organization_id
async function getRequests(organizationId: number) {
  const pool = getApplicationPool();
  const result = await pool.query(
    'SELECT * FROM requests WHERE organization_id = $1',
    [organizationId]
  );
  return result.rows;
}

// ❌ Wrong: Missing organization_id filter
async function getRequests() {
  const pool = getApplicationPool();
  const result = await pool.query('SELECT * FROM requests');
  return result.rows; // Returns ALL organizations' data!
}
```

### Middleware for Organization Access

```typescript
// server/src/middleware/tenant-auth.ts
import { Request, Response, NextFunction } from 'express';
import { getApplicationPool } from '../config/databases';

export async function requireOrganizationAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user; // From JWT auth middleware
  const organizationId = req.params.organizationId || user.organization_id;
  
  // Verify user belongs to organization
  const pool = getApplicationPool();
  const result = await pool.query(
    'SELECT id FROM users WHERE id = $1 AND organization_id = $2',
    [user.id, organizationId]
  );
  
  if (result.rows.length === 0) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Add organization_id to request for all queries
  req.organizationId = organizationId;
  next();
}
```

---

## Environment Variables Summary

### Server (`server/.env.local`)
```bash
# Application Database (Required)
DATABASE_URL=postgresql://neondb_owner:npg_BAJL6D0WyUTQ@ep-spring-snow-af038yg8-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Marketing Database (Optional - only if server needs to access it)
MARKETING_DATABASE_URL=postgresql://user:pass@your-marketing-db-pooler.neon.tech/neondb?sslmode=require

# Other required variables
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=3000
NODE_ENV=development
```

### Marketing (`marketing/.env.local`)
```bash
# Marketing Database (Required for marketing site)
MARKETING_DATABASE_URL=postgresql://user:pass@your-marketing-db-pooler.neon.tech/neondb?sslmode=require

# Other marketing variables
NEXT_PUBLIC_SITE_URL=https://currentmesh.com
```

---

## Verification

### Check Application Database Connection
```bash
cd /var/www/currentmesh/server
psql $DATABASE_URL -c "SELECT current_database(), COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
```

### Check Marketing Database Connection
```bash
cd /var/www/currentmesh/marketing
psql $MARKETING_DATABASE_URL -c "SELECT current_database();"
```

### Verify Organizations Table
```bash
cd /var/www/currentmesh/server
psql $DATABASE_URL -c "SELECT * FROM organizations;"
```

---

## Next Steps

1. ✅ Configure `MARKETING_DATABASE_URL` in `marketing/.env.local`
2. ✅ Create `organizations` table in application database
3. ✅ Add `organization_id` to existing tenant tables
4. ✅ Create indexes for `organization_id` columns
5. ✅ Implement tenant isolation middleware
6. ✅ Update all queries to filter by `organization_id`

---

**Related Documents:**
- [[.ai/DATABASE-ARCHITECTURE.md]] - Architecture overview
- [[.ai/prd.md]] - Product Requirements Document


