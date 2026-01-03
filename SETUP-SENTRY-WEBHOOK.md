# Setup Sentry Webhook for Automated Error Reporting

**Quick guide to connect Sentry → Backend → Agent**

---

## ✅ What's Already Done

- ✅ Webhook receiver endpoint created
- ✅ Database table migration ready
- ✅ Agent query endpoints created
- ✅ Error storage system ready

---

## 🔧 What You Need to Do

### Step 1: Run Server (Creates Database Table)

```bash
cd /var/www/currentmesh/server
npm run dev
```

The migration runs automatically and creates the `sentry_errors` table.

### Step 2: Configure Sentry Webhook

1. **Go to Sentry Dashboard**
   - Navigate to your organization
   - Go to **Settings** → **Integrations** → **Webhooks**
   - Click **Create Webhook**

2. **Configure Webhook**
   - **URL**: `https://api.currentmesh.com/api/sentry/webhook`
   - **Events**: Select:
     - ✅ Issue created
     - ✅ Issue updated
     - ✅ Issue resolved
   - **Secret** (optional): Generate with:
     ```bash
     openssl rand -hex 32
     ```
     Then add to `server/.env.local`:
     ```env
     SENTRY_WEBHOOK_SECRET=your_generated_secret
     ```

3. **Save Webhook**

### Step 3: Test It

```bash
# Trigger test error
curl http://localhost:3000/api/test-sentry

# Check if error was stored
curl http://localhost:3000/api/agent/errors
```

---

## 🤖 How Agent Accesses Errors

The agent can now query errors automatically:

```bash
# Get unresolved errors
GET /api/agent/errors

# Get errors for specific app
GET /api/agent/errors?app=backend

# Get error details
GET /api/agent/errors/:id

# Mark as resolved
POST /api/agent/errors/:id/resolve
```

---

## 📊 What Happens

1. **Error occurs** → Sentry detects it
2. **Sentry sends webhook** → Your backend receives it
3. **Backend stores error** → Database table
4. **Agent queries errors** → Automatically checks for new errors
5. **Agent fixes errors** → Marks as resolved

---

## 🔒 Security (Optional)

Add webhook secret to prevent unauthorized access:

1. Generate secret:
   ```bash
   openssl rand -hex 32
   ```

2. Add to `server/.env.local`:
   ```env
   SENTRY_WEBHOOK_SECRET=your_secret_here
   ```

3. Add same secret to Sentry webhook configuration

---

**Once webhook is configured, errors will automatically flow to the agent!** 🚀

See `.ai/AUTOMATED-ERROR-REPORTING.md` for full details.

