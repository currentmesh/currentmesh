# Sentry Project Structure

**Date**: 2025-12-31  
**Status**: ✅ Correct Setup - 2 Projects Only

---

## Current Setup

### ✅ Project 1: Frontend (Project ID: 4510628587634688)
**Used by**:
- Marketing Site (`currentmesh.com`)
- Admin Dashboard (`app.currentmesh.com`)

**DSN**: `https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688`

**Why share?**
- Both are frontend applications (browser-based)
- Same error types (JavaScript errors, React errors)
- Same performance metrics (LCP, FID, CLS, INP)
- Easier to manage and compare

---

### ✅ Project 2: Backend (Project ID: 4510628617191424)
**Used by**:
- Backend API (`api.currentmesh.com`)

**DSN**: `https://0dedf871efa867ac8a3fd3894a4edad3@o4510628533370880.ingest.us.sentry.io/4510628617191424`

**Why separate?**
- Different error types (Node.js, Express, database)
- Different performance metrics (API response times, database queries)
- Different debugging context (server logs, stack traces)

---

## Why This Setup is Optimal

### ✅ Advantages

1. **Logical Separation**
   - Frontend errors (browser) vs Backend errors (server)
   - Different debugging approaches
   - Different performance metrics

2. **Easier Management**
   - 2 projects instead of 3
   - Less configuration overhead
   - Simpler alert rules

3. **Better Organization**
   - Frontend: All client-side issues in one place
   - Backend: All server-side issues in one place
   - Clear separation of concerns

4. **Cost Effective**
   - Sentry pricing is per project
   - Fewer projects = lower cost
   - Shared frontend project = better value

---

## How to Distinguish Errors

### In Sentry Dashboard

**Frontend Project**:
- Filter by `environment`: `development` or `production`
- Filter by `tags.page`: `/` (marketing) vs `/dashboard` (admin)
- Filter by `tags.app`: `marketing` or `admin` (if you add these tags)

**Backend Project**:
- Filter by `environment`: `development` or `production`
- Filter by `tags.path`: API route paths
- Filter by `tags.method`: HTTP methods

---

## Optional: Add Tags for Better Filtering

If you want to distinguish marketing vs admin in the frontend project, add tags:

### Marketing Site
```typescript
Sentry.setTag('app', 'marketing');
Sentry.setTag('site', 'currentmesh.com');
```

### Admin Dashboard
```typescript
Sentry.setTag('app', 'admin');
Sentry.setTag('site', 'app.currentmesh.com');
```

This way you can filter in Sentry:
- `app:marketing` - Marketing site errors
- `app:admin` - Admin dashboard errors

---

## Summary

✅ **You have the correct setup: 2 projects**
- Frontend: Marketing + Admin Dashboard
- Backend: API Server

❌ **You do NOT need a third project**

This is the optimal configuration for your architecture!

