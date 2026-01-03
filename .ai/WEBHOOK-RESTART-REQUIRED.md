# Webhook Restart Requirement

**Question**: Do you need to restart the server for the webhook to work?

**Answer**: ✅ **Yes, if the server wasn't running. If it was running, restart to load new routes.**

---

## Current Status

The webhook endpoint is **coded and ready**, but the server must be **running** to receive webhooks.

---

## How to Start/Restart Server

### Option 1: Development Mode (Manual)
```bash
cd /var/www/currentmesh/server
PORT=3000 NODE_ENV=development npx tsx src/index.ts
```

### Option 2: Background Process
```bash
cd /var/www/currentmesh/server
PORT=3000 NODE_ENV=development npx tsx src/index.ts > /tmp/currentmesh-server.log 2>&1 &
```

### Option 3: PM2 (Production)
```bash
cd /var/www/currentmesh/server
pm2 start npm --name "currentmesh-api" -- run dev
# Or if ecosystem file exists:
pm2 start ecosystem.config.js
```

---

## Verify Webhook is Working

### Test Webhook Endpoint
```bash
# Test endpoint exists
curl -X POST http://localhost:3000/api/sentry/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":true}'
```

### Test with Sentry
```bash
# Trigger test error
curl http://localhost:3000/api/test-sentry

# Check if error was stored
curl http://localhost:3000/api/agent/errors
```

---

## After Restart

Once server is running:
1. ✅ Webhook endpoint is accessible at `/api/sentry/webhook`
2. ✅ Sentry can send events to your server
3. ✅ Errors will be stored in database
4. ✅ Agent can query errors via `/api/agent/errors`

---

**Server must be running for webhook to receive events!** 🚀

