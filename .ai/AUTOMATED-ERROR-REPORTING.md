# Automated Error Reporting to Agent

**Date**: 2025-12-31  
**Status**: ✅ Setup Complete

---

## How It Works

1. **Sentry** detects an error
2. **Sentry Webhook** sends error to your backend API
3. **Backend** stores error in database
4. **Agent** queries database for recent errors
5. **Agent** fixes errors automatically

---

## Setup Steps

### Step 1: Run Database Migration

The database table is created automatically when the server starts. If you need to run it manually:

```bash
cd /var/www/currentmesh/server
npm run dev
```

The migration will run automatically on server start.

### Step 2: Configure Sentry Webhook

1. **Go to Sentry Dashboard**
   - Navigate to **Settings** → **Integrations** → **Webhooks**
   - Click **Create Webhook**

2. **Configure Webhook**
   - **URL**: `https://api.currentmesh.com/api/sentry/webhook`
   - **Events**: Select these events:
     - ✅ Issue created
     - ✅ Issue updated
     - ✅ Issue resolved
   - **Secret** (optional): Generate a secret and add to `.env.local`:
     ```env
     SENTRY_WEBHOOK_SECRET=your_secret_here
     ```

3. **Save Webhook**

### Step 3: Test Webhook

Trigger a test error:
```bash
curl http://localhost:3000/api/test-sentry
```

Check if error was stored:
```bash
curl http://localhost:3000/api/agent/errors
```

---

## Agent Access

### Query Recent Errors

```bash
# Get last 10 unresolved errors
curl http://localhost:3000/api/agent/errors

# Get errors for specific app
curl http://localhost:3000/api/agent/errors?app=backend

# Get resolved errors
curl http://localhost:3000/api/agent/errors?status=resolved

# Get more errors
curl http://localhost:3000/api/agent/errors?limit=50
```

### Get Error Details

```bash
curl http://localhost:3000/api/agent/errors/{id}
```

### Mark Error as Resolved

```bash
curl -X POST http://localhost:3000/api/agent/errors/{id}/resolve
```

---

## API Endpoints

### Webhook Receiver
- **POST** `/api/sentry/webhook` - Receives errors from Sentry

### Agent Endpoints
- **GET** `/api/agent/errors` - Query recent errors
  - Query params:
    - `limit` - Number of errors (default: 10)
    - `status` - `unresolved` or `resolved` (default: `unresolved`)
    - `app` - Filter by app tag (`marketing`, `admin`, `backend`)
- **GET** `/api/agent/errors/:id` - Get error details
- **POST** `/api/agent/errors/:id/resolve` - Mark error as resolved

---

## Database Schema

```sql
CREATE TABLE sentry_errors (
  id SERIAL PRIMARY KEY,
  sentry_id VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  level VARCHAR(50) NOT NULL,
  url TEXT,
  environment VARCHAR(50),
  tags JSONB,
  metadata JSONB,
  timestamp TIMESTAMP,
  project VARCHAR(255),
  raw_data JSONB,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## How Agent Uses This

The agent can now:

1. **Query errors automatically**:
   ```typescript
   const errors = await fetch('/api/agent/errors?status=unresolved');
   ```

2. **Get error details**:
   ```typescript
   const error = await fetch(`/api/agent/errors/${errorId}`);
   ```

3. **Fix errors** and mark as resolved:
   ```typescript
   await fetch(`/api/agent/errors/${errorId}/resolve`, { method: 'POST' });
   ```

---

## Security

### Webhook Secret (Recommended)

Add to `server/.env.local`:
```env
SENTRY_WEBHOOK_SECRET=your_random_secret_here
```

Generate a secret:
```bash
openssl rand -hex 32
```

Then add it to Sentry webhook configuration.

---

## Monitoring

### Check Webhook Status

```bash
# Check if webhook is receiving errors
curl http://localhost:3000/api/agent/errors?limit=1
```

### Check Database

```sql
SELECT COUNT(*) FROM sentry_errors WHERE resolved_at IS NULL;
```

---

## Next Steps

1. ✅ Database migration created
2. ✅ Webhook endpoint created
3. ✅ Agent query endpoints created
4. ⏳ Configure Sentry webhook (you need to do this)
5. ⏳ Test webhook with test error

---

**Once Sentry webhook is configured, errors will automatically flow to the agent!** 🚀

