# Error Reporting Guide

**Quick reference for reporting errors from Sentry**

---

## ✅ Current Workflow

1. **You monitor** Sentry dashboards (or set up alerts)
2. **You report** errors to me
3. **I fix** the errors

---

## 📋 How to Report Errors

### Quick Template

```
**Error Report**

Error: [error message]
URL: [page/endpoint where it happened]
Sentry Link: [Sentry issue URL]
Context: [what you were doing]
Priority: Critical / Important / Low
```

### What to Include

1. **Error Message** - Exact text from Sentry
2. **URL/Endpoint** - Where it happened
3. **Sentry Issue Link** - Direct link to Sentry issue
4. **Context** - What you were doing
5. **Screenshots** (optional) - If helpful

---

## 🎯 What to Monitor

### Critical (Report Immediately)
- ❌ Server crashes (500 errors)
- ❌ Database failures
- ❌ Authentication issues
- ❌ Payment errors

### Important (Report Soon)
- ⚠️ Missing pages (404)
- ⚠️ Permission errors (403)
- ⚠️ API timeouts
- ⚠️ Slow performance

### Low Priority (When Convenient)
- ℹ️ Console warnings
- ℹ️ Minor UI issues
- ℹ️ Non-critical errors

---

## 🔔 Optional: Set Up Alerts

Instead of manually checking, set up Sentry alerts:

1. **Go to Sentry** → Settings → Alerts
2. **Create alert rules** for:
   - Critical errors
   - Error rate spikes
   - New error types
3. **Get notified** via email/Slack

See `.ai/SENTRY-ALERTS-SETUP.md` for detailed instructions.

---

## 📊 Sentry Dashboard Links

- **Frontend Project**: Marketing + Admin Dashboard
- **Backend Project**: API Server

Filter by tags:
- `app:marketing` - Marketing site
- `app:admin` - Admin dashboard
- `app:backend` - Backend API

---

## 💡 Tips

- ✅ Check Sentry daily (or set up alerts)
- ✅ Include Sentry links when reporting
- ✅ Note user impact (how many affected?)
- ✅ Report critical errors immediately

---

**Just paste the error details and I'll fix it!** 🐛→✅

