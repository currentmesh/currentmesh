# Manual Event Hook Setup (Required)

**Status**: Sentry API doesn't support programmatic event hook creation  
**Solution**: Set up manually in Sentry Dashboard

---

## Quick Setup Steps

### 1. Go to Event Hooks
- In Sentry Dashboard → **Settings** → **Integrations**
- Find **"Event Hooks"** in the list
- Click **"Event Hooks"** or **"Configure"**

### 2. Create New Hook
- Click **"Create Hook"** or **"Add Hook"** button

### 3. Configure Hook

**Webhook URL**:
```
https://api.currentmesh.com/api/sentry/webhook
```

**Events** (select these):
- ✅ `issue.created` - When a new error occurs
- ✅ `issue.updated` - When error details change
- ✅ `issue.resolved` - When error is marked resolved

**Optional - Secret**:
1. Generate secret:
   ```bash
   openssl rand -hex 32
   ```
2. Paste in Sentry webhook form
3. Add to `server/.env.local`:
   ```env
   SENTRY_WEBHOOK_SECRET=your_generated_secret_here
   ```

### 4. Save
- Click **"Save"** or **"Create Hook"**
- Sentry will test the connection

---

## Test After Setup

```bash
# Trigger test error
curl http://localhost:3000/api/test-sentry

# Check if error was received
curl http://localhost:3000/api/agent/errors
```

---

## Your Organization Info

- **Organization**: `current-mesh` (or ID: `4510628533370880`)
- **Webhook URL**: `https://api.currentmesh.com/api/sentry/webhook`

---

**Once saved, errors will automatically flow to the agent!** 🚀

