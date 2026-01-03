# Database Access Patterns by Application

**Date**: 2025-01-01  
**Purpose**: Document how each application accesses the shared database

---

## Shared Application Database

**Database**: `ep-red-queen-afcvvwpf-pooler`  
**Used By**: All three applications (`/admin`, `/app`, `/client`)  
**Schema**: Single multi-tenant schema with `organization_id` isolation

---

## 1. Admin Application (`admin.currentmesh.com`)

### Access Level
- **Scope**: Platform-wide (ALL organizations)
- **Role**: Super Admin
- **Organization Filter**: None (can see all organizations)

### Tables Accessed
```sql
-- Organizations (all)
SELECT * FROM organizations;

-- Users (all organizations)
SELECT * FROM users;

-- Subscriptions (all)
SELECT * FROM subscriptions;

-- Platform-wide analytics
SELECT organization_id, COUNT(*) FROM requests GROUP BY organization_id;
```

### Use Cases
- Create/manage organizations
- View all tenants
- Platform analytics
- Billing/subscriptions
- System configuration

### Security
- Requires `super_admin` role
- No organization_id filtering needed
- Can access any organization's data

---

## 2. App Application (`app.currentmesh.com`)

### Access Level
- **Scope**: Single organization (tenant-specific)
- **Role**: Admin, User (within organization)
- **Organization Filter**: `organization_id = user.organization_id`

### Tables Accessed
```sql
-- Users (same organization only)
SELECT * FROM users WHERE organization_id = $1;

-- Clients (same organization)
SELECT * FROM clients WHERE organization_id = $1;

-- Requests (same organization)
SELECT * FROM requests WHERE organization_id = $1;

-- Documents (same organization)
SELECT * FROM documents WHERE organization_id = $1;

-- Workpapers (same organization)
SELECT * FROM workpapers WHERE organization_id = $1;
```

### Use Cases
- Manage requests for their organization
- Upload/organize documents
- Create workpapers
- Assign requests to team members
- View organization dashboard

### Security
- Requires JWT authentication
- Middleware validates `organization_id` access
- All queries filtered by `organization_id`
- Users can only see their organization's data

---

## 3. Client Application (`client.currentmesh.com`)

### Access Level
- **Scope**: Single organization, single client
- **Role**: Client (external user)
- **Organization Filter**: `organization_id = client.organization_id`
- **Client Filter**: `client_id = session.client_id`

### Tables Accessed
```sql
-- Client (self only)
SELECT * FROM clients WHERE id = $1 AND organization_id = $2;

-- Requests (assigned to this client)
SELECT * FROM requests 
WHERE client_id = $1 
AND organization_id = $2;

-- Documents (uploaded by this client)
SELECT * FROM documents 
WHERE client_id = $1 
AND organization_id = $2;

-- Client portal sessions
SELECT * FROM client_portal_sessions 
WHERE client_id = $1;
```

### Use Cases
- View requests assigned to them
- Upload documents for requests
- Track request status
- View their document history
- Update client profile

### Security
- Requires client portal session token
- Middleware validates `client_id` and `organization_id`
- All queries filtered by both `client_id` AND `organization_id`
- Clients can only see their own data

---

## Query Pattern Examples

### Admin Query (No Filter)
```typescript
// Admin: Get all organizations
const organizations = await sql`
  SELECT * FROM organizations
  ORDER BY created_at DESC
`;
```

### App Query (Organization Filter)
```typescript
// App: Get requests for current organization
const requests = await sql`
  SELECT * FROM requests 
  WHERE organization_id = ${user.organization_id}
  ORDER BY created_at DESC
`;
```

### Client Query (Organization + Client Filter)
```typescript
// Client: Get requests assigned to this client
const requests = await sql`
  SELECT * FROM requests 
  WHERE organization_id = ${client.organization_id}
  AND client_id = ${client.id}
  ORDER BY created_at DESC
`;
```

---

## Middleware Implementation

### Admin Middleware
```typescript
// server/src/middleware/admin-auth.ts
export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user; // From JWT
  
  if (user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  // No organization_id filter - can access all data
  next();
}
```

### App Middleware
```typescript
// server/src/middleware/tenant-auth.ts
export async function requireOrganizationAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user; // From JWT
  const organizationId = req.params.organizationId || user.organization_id;
  
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

### Client Middleware
```typescript
// server/src/middleware/client-auth.ts
export async function requireClientAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = req.clientSession; // From client portal session token
  const clientId = req.params.clientId || session.client_id;
  
  // Verify client belongs to organization
  if (clientId !== session.client_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Add client_id and organization_id to request
  req.clientId = clientId;
  req.organizationId = session.organization_id;
  next();
}
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│  Application Database                    │
│  (ep-red-queen-afcvvwpf-pooler)         │
│                                          │
│  Tables:                                 │
│  - organizations                         │
│  - users (organization_id)              │
│  - clients (organization_id)             │
│  - requests (organization_id)            │
│  - documents (organization_id)            │
│  - workpapers (organization_id)          │
└─────────────────────────────────────────┘
           ↕ API (server/)
    ┌──────┴──────┬──────────┐
    │             │          │
┌───▼───┐  ┌─────▼───┐  ┌───▼────┐
│ Admin │  │   App   │  │ Client │
│ (all) │  │ (org)   │  │ (self) │
└───────┘  └─────────┘  └────────┘
```

---

## Summary

| Application | Organization Filter | Client Filter | Access Level |
|-------------|-------------------|---------------|--------------|
| **Admin** | None (all orgs) | None | Platform-wide |
| **App** | `organization_id = user.org` | None | Organization-wide |
| **Client** | `organization_id = client.org` | `client_id = session.client_id` | Self only |

---

**Related Documents:**
- [[.ai/DATABASE-ARCHITECTURE.md]] - Database architecture overview
- [[.ai/DATABASE-SETUP-GUIDE.md]] - Setup guide


