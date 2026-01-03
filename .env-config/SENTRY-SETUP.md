# Sentry Setup Guide

**Date**: 2025-12-31  
**Status**: API key configured, ready for integration

---

## Sentry Configuration

### API Key Stored
- ✅ API key saved securely in `.env-config/.env`
- ✅ File permissions: 600 (owner read/write only)
- ✅ Added to `.gitignore` (never committed)

### API Key
```
your_sentry_auth_token_here
```

---

## Setup Instructions

### 1. Get Sentry Organization and Project Info

You'll need:
- **Organization Slug**: Your Sentry organization name
- **Project Slug**: Your Sentry project name (e.g., "currentmesh")

Find these in Sentry Dashboard:
1. Go to: https://sentry.io/
2. Select your organization
3. Go to Settings → Projects
4. Note the organization slug and project slug

### 2. Update Environment File

```bash
cd /var/www/currentmesh
nano .env-config/.env
```

Update:
```
SENTRY_ORG=your_org_slug_here
SENTRY_PROJECT=currentmesh
```

### 3. Install Sentry SDKs

**Marketing Site (Next.js)**:
```bash
cd /var/www/currentmesh/marketing
pnpm add @sentry/nextjs
```

**Admin Dashboard (React/Vite)**:
```bash
cd /var/www/currentmesh/client
npm install @sentry/react
```

**Backend API (Express.js)**:
```bash
cd /var/www/currentmesh/server
npm install @sentry/node
```

---

## Integration Examples

### Next.js (Marketing Site)

Create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

Create `sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### React/Vite (Admin Dashboard)

In `src/main.tsx` or `src/index.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});
```

### Express.js (Backend API)

In `src/index.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Add Sentry request handler
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add Sentry error handler (after all routes)
app.use(Sentry.Handlers.errorHandler());
```

---

## Get DSN from Sentry

1. Go to Sentry Dashboard
2. Select your project
3. Go to Settings → Client Keys (DSN)
4. Copy the DSN
5. Add to environment variables:
   - `NEXT_PUBLIC_SENTRY_DSN` (for Next.js)
   - `VITE_SENTRY_DSN` (for Vite)
   - `SENTRY_DSN` (for backend)

---

## Environment Variables

### Marketing Site (`.env.local`)
```env
NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
SENTRY_DSN=your_dsn_here
NODE_ENV=production
```

### Admin Dashboard (`.env.local`)
```env
VITE_SENTRY_DSN=your_dsn_here
```

### Backend API (`.env.local`)
```env
SENTRY_DSN=your_dsn_here
NODE_ENV=production
```

---

## Security Notes

- ✅ API key stored securely (600 permissions)
- ✅ API key gitignored
- ✅ DSN is safe to commit (public-facing)
- ⚠️ Never commit auth tokens or API keys

---

## Next Steps

1. Get organization and project slugs from Sentry
2. Update `.env-config/.env` with org/project info
3. Get DSN from Sentry dashboard
4. Install Sentry SDKs in each project
5. Configure Sentry in each project
6. Test error reporting

---

**Sentry API Key Configured!** 🎉

