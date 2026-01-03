# Sentry Tags Added ✅

**Date**: 2025-12-31  
**Status**: Tags configured for all projects

---

## Tags Added

### Marketing Site (`currentmesh.com`)
- `app: marketing`
- `site: currentmesh.com`
- `platform: nextjs`
- `runtime: server` (server-side) or `edge` (edge runtime)

### Admin Dashboard (`app.currentmesh.com`)
- `app: admin`
- `site: app.currentmesh.com`
- `platform: react`

### Backend API (`api.currentmesh.com`)
- `app: backend`
- `site: api.currentmesh.com`
- `platform: nodejs`
- `runtime: express`

---

## How to Use Tags in Sentry

### Filter by App
- `app:marketing` - Marketing site errors
- `app:admin` - Admin dashboard errors
- `app:backend` - Backend API errors

### Filter by Site
- `site:currentmesh.com` - Marketing site
- `site:app.currentmesh.com` - Admin dashboard
- `site:api.currentmesh.com` - Backend API

### Filter by Platform
- `platform:nextjs` - Marketing site
- `platform:react` - Admin dashboard
- `platform:nodejs` - Backend API

---

## Example Queries

### All Marketing Site Errors
```
app:marketing
```

### All Admin Dashboard Errors
```
app:admin
```

### All Backend Errors
```
app:backend
```

### Marketing Site + Admin Dashboard (Frontend)
```
app:marketing OR app:admin
```

---

## Files Updated

### Marketing Site
- `marketing/sentry.client.config.ts` - Client-side tags
- `marketing/sentry.server.config.ts` - Server-side tags
- `marketing/sentry.edge.config.ts` - Edge runtime tags

### Admin Dashboard
- `client/src/main.tsx` - Sentry initialization with tags

### Backend API
- `server/src/index.ts` - Sentry initialization with tags

---

**Tags are now active!** You can filter errors in Sentry by app, site, or platform.

