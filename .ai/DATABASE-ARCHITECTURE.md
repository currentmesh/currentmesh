# CurrentMesh Database Architecture

**Date**: 2025-01-01  
**Status**: Recommended Architecture  
**Purpose**: Multi-tenant request management and workpaper platform

---

## Recommended Architecture: 2-Database Setup

### Overview

```
┌─────────────────────────────────────────┐
│  Database 1: Marketing Content          │
│  Purpose: Public marketing content      │
│  Access: marketing/ app only           │
│  Tenant Isolation: Not needed           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Database 2: Application Data           │
│  Purpose: All tenant & platform data    │
│  Access: app/, client/, admin/, server/ │
│  Tenant Isolation: organization_id      │
└─────────────────────────────────────────┘
```

---

## Database 1: Marketing Content Database

### Purpose
- Public-facing marketing content
- Blog posts, CMS pages, case studies
- No tenant isolation needed (public content)
- Minimal security requirements

### Tables (Marketing-specific)
```
marketing_content/
├── blog_posts              (Blog articles)
├── cms_pages              (Content pages)
├── cms_media              (Media library)
├── testimonials           (Customer reviews)
├── case_studies           (Success stories)
├── newsletter_signups      (Email list)
└── page_views             (Analytics)
```

### Environment Variable
```bash
MARKETING_DATABASE_URL=postgresql://...
```

### Access
- **Read/Write**: `marketing/` app (Next.js)
- **Read Only**: Public (via marketing site)
- **No Access**: `app/`, `client/`, `admin/`, `server/`

---

## Database 2: Application Data Database

### Purpose
- All tenant data (organizations, users, clients, requests, documents)
- Platform management (super admin data)
- Multi-tenant isolation via `organization_id`
- High security requirements (SOC 2, GDPR)

### Tenant Isolation Strategy
**Use `organization_id` column on all tenant tables**

```sql
-- Example: All tenant tables have organization_id
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  -- ... other fields
);

-- Always filter by organization_id in queries
SELECT * FROM requests WHERE organization_id = $1;
```

### Tables Structure

#### Platform Management (No organization_id)
```
platform/
├── organizations          (Tenant organizations)
├── subscriptions          (Organization subscriptions)
├── platform_settings      (Global platform config)
└── audit_logs             (Platform-wide audit trail)
```

#### Tenant Data (With organization_id)
```
tenant_data/
├── users                  (organization_id)
├── clients                (organization_id)
├── requests               (organization_id)
├── documents              (organization_id)
├── workpapers             (organization_id)
├── comments               (organization_id)
├── notifications          (organization_id)
└── ... (all tenant tables)
```

#### Client Portal Data (With organization_id)
```
client_portal/
├── client_portal_sessions (organization_id, client_id)
├── client_magic_link_tokens (organization_id, client_id)
└── client_portal_preferences (organization_id, client_id)
```

### Environment Variable
```bash
DATABASE_URL=postgresql://...
```

### Access
- **Read/Write**: `server/` (Express API)
- **Read/Write**: `app/` (via API only)
- **Read/Write**: `client/` (via API only)
- **Read/Write**: `admin/` (via API only)
- **No Direct Access**: Frontend apps never connect directly

---

## Why 2 Databases Instead of 4?

### ❌ Why NOT Separate Databases for Each App

**Separate databases would be:**
- Marketing DB
- App DB
- Client Portal DB
- Admin DB

**Problems:**
1. **Data Duplication**: Organizations, users, clients exist in multiple places
2. **Complex Joins**: Cross-database queries are slow and complex
3. **Data Consistency**: Hard to keep data in sync
4. **Higher Cost**: 4 databases instead of 2
5. **Over-Engineering**: Marketing doesn't need tenant isolation

### ✅ Why 2 Databases Works Better

**Benefits:**
1. **Clear Separation**: Marketing (public) vs Application (private)
2. **Single Source of Truth**: All tenant data in one place
3. **Simple Queries**: All tenant data in same database
4. **Cost Effective**: Only 2 databases
5. **Easy Scaling**: Can split later if needed

---

## Multi-Tenant Isolation Strategy

### Row-Level Isolation (Recommended)

All tenant tables include `organization_id`:

```typescript
// Example: Get requests for current organization
async function getRequests(organizationId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  return sql`
    SELECT * FROM requests 
    WHERE organization_id = ${organizationId}
  `;
}
```

### Middleware Protection

Always validate organization access:

```typescript
// server/src/middleware/tenant-auth.ts
export async function requireOrganizationAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user; // From JWT
  const organizationId = req.params.organizationId;
  
  // Verify user belongs to organization
  const hasAccess = await checkUserOrganizationAccess(
    user.id,
    organizationId
  );
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Add organization_id to request for all queries
  req.organizationId = organizationId;
  next();
}
```

### Query Helpers

Always include organization_id in queries:

```typescript
// server/src/db/queries/requests.ts
export async function getRequestById(
  requestId: number,
  organizationId: number
) {
  const sql = neon(process.env.DATABASE_URL!);
  const [request] = await sql`
    SELECT * FROM requests 
    WHERE id = ${requestId} 
    AND organization_id = ${organizationId}
  `;
  return request;
}
```

---

## Database Schema Examples

### Organizations Table
```sql
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE, -- For future: {subdomain}.app.currentmesh.com
  status VARCHAR(50) DEFAULT 'active',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table (with organization_id)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user', -- user, admin, super_admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, email)
);
```

### Requests Table (with organization_id)
```sql
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  client_id INTEGER REFERENCES clients(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to INTEGER REFERENCES users(id),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

### Development (.env.local)
```bash
# Marketing Database
MARKETING_DATABASE_URL=postgresql://user:pass@host/marketing_db

# Application Database
DATABASE_URL=postgresql://user:pass@host/app_db
```

### Production
```bash
# Marketing Database (Neon)
MARKETING_DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-west-2.aws.neon.tech/marketing_db

# Application Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.us-west-2.aws.neon.tech/app_db
```

---

## Migration Strategy

### Phase 1: Single Database (Current)
- All data in one database
- Add `organization_id` to tenant tables
- Set `organization_id = 1` for existing data

### Phase 2: Split Marketing (Recommended)
- Create marketing database
- Migrate marketing tables
- Update marketing app to use `MARKETING_DATABASE_URL`

### Phase 3: Multi-Tenant (Future)
- Add organizations table
- Add organization_id to all tenant tables
- Implement tenant isolation middleware

---

## Security Considerations

### Database Access
- **Marketing DB**: Only marketing app has access
- **Application DB**: Only server API has direct access
- **Frontend Apps**: Never connect directly, always via API

### Tenant Isolation
- **Always filter by organization_id** in queries
- **Middleware validation** for organization access
- **Row-level security** (PostgreSQL RLS) as backup (optional)

### Data Encryption
- **At Rest**: Database encryption (Neon handles this)
- **In Transit**: SSL/TLS connections
- **Sensitive Fields**: Encrypt SSN, credit cards, etc. in application layer

---

## Cost Considerations

### Neon PostgreSQL Pricing
- **Free Tier**: 1 database, 0.5 GB storage
- **Launch**: $19/month per database, 10 GB storage
- **Scale**: $69/month per database, 50 GB storage

### Recommended Setup
- **Marketing DB**: Free tier (small, public content)
- **Application DB**: Launch tier ($19/month, multi-tenant data)

**Total Cost**: ~$19/month (or free if both fit in free tier)

---

## Alternative: Single Database (Simpler Start)

If you want to start even simpler:

### Single Database with organization_id
- All data in one database
- Marketing tables (no organization_id)
- Tenant tables (with organization_id)
- **Cost**: $0-19/month (one database)

### When to Split Later
- Marketing content grows significantly
- Need different backup/retention policies
- Compliance requires separation
- Performance optimization needed

---

## Recommendation

**Start with 2 databases:**
1. ✅ **Marketing DB**: Public content (separate for clarity)
2. ✅ **Application DB**: All tenant data with `organization_id`

**Benefits:**
- Clear separation of concerns
- Marketing doesn't need tenant isolation
- All tenant data in one place (easier queries)
- Can scale independently
- Cost-effective ($19/month or free)

**Migration Path:**
1. Start with single database (add organization_id)
2. Split marketing when ready
3. Add multi-tenant features incrementally

---

## Next Steps

1. **Create databases in Neon**
   - Marketing database
   - Application database

2. **Update environment variables**
   - `MARKETING_DATABASE_URL`
   - `DATABASE_URL`

3. **Create schema migrations**
   - Organizations table
   - Add organization_id to tenant tables

4. **Implement tenant middleware**
   - Organization access validation
   - Query helpers with organization_id

5. **Update API endpoints**
   - Add organization_id to all tenant queries
   - Validate organization access

---

**Related Documents:**
- [[.ai/prd.md]] - Product Requirements Document
- [[.ai/arch.md]] - Architecture Document (future)


