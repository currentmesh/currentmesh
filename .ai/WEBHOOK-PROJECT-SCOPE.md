# Sentry Webhook Project Scope

**Question**: Does the webhook receive events from both projects?

---

## ✅ Yes - Organization-Level Webhook

The webhook you created is at the **Organization level** (Settings → Integrations → Event Hooks), which means:

### It Receives Events From:
- ✅ **Frontend Project** (Marketing + Admin Dashboard)
- ✅ **Backend Project** (Backend API)
- ✅ **Any future projects** in the organization

---

## How It Works

### Event Flow:
1. **Error occurs** in Frontend or Backend
2. **Sentry detects** it in respective project
3. **Sentry sends webhook** to your backend
4. **Webhook includes project info** in the payload
5. **Backend stores** with project identifier

### Webhook Payload Includes:
```json
{
  "project": {
    "slug": "currentmesh-frontend" // or "currentmesh-backend"
  },
  "issue": {
    "id": "...",
    "title": "...",
    "tags": [
      {"key": "app", "value": "marketing"}, // or "admin" or "backend"
      ...
    ]
  }
}
```

---

## Backend Handling

The webhook receiver already handles this:

```typescript
// From sentry-webhook.ts
const errorData = {
  project: event.project?.slug || 'unknown',
  tags: event.tags || event.issue?.tags || {},
  // ... other fields
};
```

The backend stores the **project name** and **tags** (including `app:marketing`, `app:admin`, `app:backend`), so you can filter by project.

---

## Filtering by Project

### In Agent Queries:
```bash
# Get errors from backend only
GET /api/agent/errors?app=backend

# Get errors from frontend only
GET /api/agent/errors?app=marketing

# Get all errors
GET /api/agent/errors
```

### In Database:
```sql
SELECT * FROM sentry_errors WHERE project = 'currentmesh-backend';
SELECT * FROM sentry_errors WHERE tags->>'app' = 'backend';
```

---

## Verification

To verify it's receiving from both projects:

1. **Trigger frontend error**:
   - Visit marketing site or admin dashboard
   - Cause a JavaScript error

2. **Trigger backend error**:
   ```bash
   curl http://localhost:3000/api/test-sentry
   ```

3. **Check received errors**:
   ```bash
   curl http://localhost:3000/api/agent/errors
   ```

You should see errors from both projects with different `project` and `app` tags.

---

## Summary

✅ **One webhook** receives events from **both projects**  
✅ **Backend stores** project identifier  
✅ **Agent can filter** by project or app tag  
✅ **Works for all future projects** in the organization

---

**Your webhook is configured correctly for both projects!** 🎉

