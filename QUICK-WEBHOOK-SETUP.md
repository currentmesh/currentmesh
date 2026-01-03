# Quick Event Hook Setup Guide

## You're at: Sentry Integrations Page

### Next Steps:

1. **Find "Event Hooks"** in the integrations list
2. **Click "Event Hooks"** or "Configure"
3. **Click "Create Hook"** or "Add Hook"

### Configuration:

**URL**: 
```
https://api.currentmesh.com/api/sentry/webhook
```

**Events** (select these):
- ✅ Issue created
- ✅ Issue updated  
- ✅ Issue resolved

**Secret** (optional):
- Generate: `openssl rand -hex 32`
- Add to `server/.env.local`: `SENTRY_WEBHOOK_SECRET=your_secret`

### Save & Test:

1. Click "Save"
2. Test with: `curl http://localhost:3000/api/test-sentry`
3. Verify: `curl http://localhost:3000/api/agent/errors`

---

**That's it!** Once saved, errors will automatically flow to the agent.
