# Event Hook Setup - Next Steps

**You're at**: Sentry Integrations Page

---

## What to Do Now

### Option 1: Create Custom Integration (Recommended)

1. **Click "Create New Integration"** (purple button, top right)
2. Select **"Internal Integration"** or **"Webhook"**
3. Configure:
   - **Name**: "CurrentMesh Error Webhook"
   - **Webhook URL**: `https://api.currentmesh.com/api/sentry/webhook`
   - **Events**: Select `issue.created`, `issue.updated`, `issue.resolved`
4. **Save**

### Option 2: Use Existing Integration

If you see a generic "Webhook" or "Event Hook" integration:
1. Click on it
2. Click "Install" or "Configure"
3. Enter webhook URL: `https://api.currentmesh.com/api/sentry/webhook`
4. Select events
5. Save

---

## What You Need

**Webhook URL**:
```
https://api.currentmesh.com/api/sentry/webhook
```

**Events to Select**:
- ✅ `issue.created`
- ✅ `issue.updated`
- ✅ `issue.resolved`

---

## After Setup

Test it:
```bash
curl http://localhost:3000/api/test-sentry
curl http://localhost:3000/api/agent/errors
```

---

**Click "Create New Integration" to get started!**

