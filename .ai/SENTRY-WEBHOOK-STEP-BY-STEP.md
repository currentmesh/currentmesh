# Sentry Webhook Setup - Step by Step

**Current Step**: You're at the Integrations page

---

## Step 1: Find Webhooks

1. On the Integrations page, look for **"Webhooks"**
2. Click on **"Webhooks"** or **"Configure"** next to it

---

## Step 2: Create Webhook

1. Click **"Create Webhook"** or **"Add Webhook"** button
2. You'll see a form to configure the webhook

---

## Step 3: Configure Webhook

Fill in these details:

### Webhook URL
```
https://api.currentmesh.com/api/sentry/webhook
```

**Note**: If your server isn't live yet, you can use:
- For local testing: Use a service like `ngrok` to expose your local server
- Or wait until server is deployed to production

### Events to Send
Select these events:
- ✅ **Issue created** - When a new error occurs
- ✅ **Issue updated** - When error details change
- ✅ **Issue resolved** - When error is marked resolved

### Secret (Optional but Recommended)
1. Generate a secret:
   ```bash
   openssl rand -hex 32
   ```
2. Copy the generated secret
3. Paste it in the "Secret" field in Sentry
4. Add it to your `server/.env.local`:
   ```env
   SENTRY_WEBHOOK_SECRET=your_generated_secret_here
   ```

---

## Step 4: Save Webhook

1. Click **"Save"** or **"Create Webhook"**
2. Sentry will test the webhook connection
3. If successful, you'll see a confirmation

---

## Step 5: Test Webhook

1. Trigger a test error:
   ```bash
   curl http://localhost:3000/api/test-sentry
   ```
   (Or visit the URL if server is running)

2. Check if error was received:
   ```bash
   curl http://localhost:3000/api/agent/errors
   ```

3. You should see the error in the response

---

## Troubleshooting

### Webhook Not Receiving Events
- Check that server is running
- Verify webhook URL is correct
- Check server logs for webhook requests
- Verify events are selected in Sentry

### 401 Unauthorized
- Check that `SENTRY_WEBHOOK_SECRET` matches in both places
- Verify secret is in `server/.env.local`

### 404 Not Found
- Verify webhook URL is correct
- Check that server routes are set up
- Ensure server is accessible

---

## What Happens Next

Once webhook is configured:
1. ✅ Errors automatically flow to your backend
2. ✅ Errors stored in database
3. ✅ Agent can query errors automatically
4. ✅ Agent fixes errors and marks resolved

---

**Need help with a specific step?** Let me know what you see on the page!

