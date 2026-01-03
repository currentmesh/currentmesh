# Integration Configuration Steps

**Current Status**: Form is pre-filled correctly!

---

## ✅ Already Configured

- ✅ **Name**: "Current Mesh Error Webhook" 
- ✅ **Webhook URL**: `https://api.currentmesh.com/api/sentry/webhook`

---

## 🔧 What to Configure

### 1. Permissions Section

Set **"Issue & Event"** to:
- **"Read"** (minimum) or **"Write"** (recommended)

All other permissions can stay "No Access".

### 2. Webhooks Section

Check the **"issue"** card checkbox.

This enables:
- ✅ `issue.created` - New errors
- ✅ `issue.resolved` - Errors marked resolved
- ✅ `issue.unresolved` - Errors that become unresolved
- ✅ `issue.assigned` - Errors assigned to someone
- ✅ `issue.archived` - Errors archived

### 3. Optional Settings

- **Alert Rule Action**: Can stay OFF (unless you want alerts)
- **Schema**: Leave empty
- **Overview**: Leave empty (or add description)
- **Authorized JavaScript Origins**: Leave empty

---

## 💾 Save

Click **"Save"** or **"Create Integration"** button at the bottom.

---

## ✅ After Saving

Test it:
```bash
curl http://localhost:3000/api/test-sentry
curl http://localhost:3000/api/agent/errors
```

---

**That's it!** Once saved, errors will automatically flow to your backend.

