# Sentry Tags Configured ✅

## Tags Added to All Projects

### Marketing Site
- `app: marketing`
- `site: currentmesh.com`
- `platform: nextjs`

### Admin Dashboard
- `app: admin`
- `site: app.currentmesh.com`
- `platform: react`

### Backend API
- `app: backend`
- `site: api.currentmesh.com`
- `platform: nodejs`
- `runtime: express`

---

## How to Filter in Sentry

### By App
- `app:marketing` - Marketing site only
- `app:admin` - Admin dashboard only
- `app:backend` - Backend API only

### By Site
- `site:currentmesh.com` - Marketing
- `site:app.currentmesh.com` - Admin
- `site:api.currentmesh.com` - Backend

### Combined Filters
- `app:marketing OR app:admin` - All frontend errors
- `app:backend` - All backend errors

---

**Tags are now active!** Filter errors in your Sentry dashboard using these tags.
