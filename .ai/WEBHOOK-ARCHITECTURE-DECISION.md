# Webhook Architecture Decision

**Question**: One webhook for both projects, or separate webhooks?

**Answer**: ✅ **One webhook is the correct approach**

---

## ✅ Recommended: One Organization-Level Webhook

### Why This Works Best:

1. **Simpler Setup**
   - One endpoint to maintain
   - One configuration to manage
   - Less complexity

2. **Automatic Coverage**
   - Receives events from all projects automatically
   - No need to configure each project separately
   - Future projects automatically included

3. **Backend Handles Filtering**
   - Backend stores project identifier
   - Backend stores app tags (`app:marketing`, `app:admin`, `app:backend`)
   - Agent can filter by project or app

4. **Standard Practice**
   - Organization-level integrations are standard
   - Most Sentry setups use this approach
   - Easier to maintain

---

## ❌ Separate Webhooks (Not Recommended)

### Why You Don't Need This:

1. **More Complexity**
   - Need to configure 2+ webhooks
   - Need to maintain multiple endpoints
   - More things to break

2. **Redundant**
   - Backend already handles project identification
   - Agent can filter by project
   - No benefit to separation

3. **Harder to Maintain**
   - Updates need to be applied to multiple webhooks
   - More configuration to manage
   - More potential points of failure

---

## How Your Current Setup Works

### Event Flow:
```
Frontend Error → Sentry Frontend Project → Organization Webhook → Backend
Backend Error → Sentry Backend Project → Organization Webhook → Backend
```

### Backend Processing:
```typescript
// Webhook receives event with project info
{
  project: { slug: "currentmesh-frontend" }, // or "currentmesh-backend"
  issue: {
    tags: [
      { key: "app", value: "marketing" }, // or "admin" or "backend"
      ...
    ]
  }
}

// Backend stores with project and tags
// Agent can filter: ?app=backend or ?app=marketing
```

---

## When You WOULD Need Separate Webhooks

Only if you need:
- **Different endpoints** for different projects
- **Different processing logic** per project
- **Different security/authentication** per project
- **Different rate limiting** per project

**None of these apply to your setup** - one endpoint handles everything.

---

## Verification

Your current setup is correct because:

✅ **One webhook** receives from both projects  
✅ **Backend stores** project identifier  
✅ **Backend stores** app tags  
✅ **Agent can filter** by project or app  
✅ **Simple to maintain**  
✅ **Standard practice**

---

## Summary

**Keep your current setup!** One organization-level webhook is:
- ✅ Simpler
- ✅ Standard practice
- ✅ Easier to maintain
- ✅ Automatically covers all projects
- ✅ Backend handles filtering

**You don't need separate webhooks.** Your current architecture is optimal.

