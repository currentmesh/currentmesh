# Error Reporting Workflow

**Date**: 2025-12-31  
**Purpose**: Guide for monitoring and reporting errors from Sentry

---

## Workflow Overview

### Option 1: Manual Monitoring (Current)
1. **You monitor** Sentry dashboards
2. **You report** errors to me
3. **I fix** the errors

### Option 2: Automated Alerts (Recommended)
1. **Sentry sends** alerts (email, Slack, etc.)
2. **You forward** alerts to me
3. **I fix** the errors

---

## How to Report Errors

### When Reporting an Error, Include:

1. **Error Message**
   - Copy the exact error message from Sentry

2. **Error URL/Endpoint**
   - Which page/route triggered it?
   - Full URL if available

3. **Sentry Issue Link**
   - Copy the Sentry issue URL
   - Example: `https://sentry.io/organizations/.../issues/.../`

4. **Context**
   - What were you doing when it happened?
   - Steps to reproduce (if known)
   - User affected (if applicable)

5. **Screenshots** (if available)
   - Sentry error details
   - Browser console errors

### Example Report Format:

```
Error: Database connection failed
URL: https://app.currentmesh.com/requests
Sentry: https://sentry.io/.../issues/12345/
Context: User was trying to load the requests list
Steps: Navigate to /requests page
```

---

## Sentry Dashboard Access

### Frontend Project (Marketing + Admin)
- **URL**: Check your Sentry dashboard
- **Filter by**: `app:marketing` or `app:admin`
- **Look for**: Red error badges, unresolved issues

### Backend Project (API)
- **URL**: Check your Sentry dashboard
- **Filter by**: `app:backend`
- **Look for**: Server errors, API failures

---

## What to Monitor

### Critical Errors (Report Immediately)
- ❌ 500 errors (server crashes)
- ❌ Database connection failures
- ❌ Authentication failures
- ❌ Payment processing errors
- ❌ File upload failures

### Important Errors (Report Soon)
- ⚠️ 404 errors (missing pages)
- ⚠️ 403 errors (permission issues)
- ⚠️ API timeouts
- ⚠️ Performance issues (slow queries)

### Low Priority (Report When Convenient)
- ℹ️ Console warnings
- ℹ️ Minor UI glitches
- ℹ️ Non-critical validation errors

---

## Sentry Alert Setup (Optional)

I can help you set up automated alerts so you don't have to check manually:

### Email Alerts
- Get notified when new errors occur
- Get notified when error rate spikes
- Get notified for critical errors only

### Slack/Discord Alerts
- Real-time notifications
- Error summaries
- Direct links to Sentry issues

### Custom Alert Rules
- Alert on specific error types
- Alert on error frequency
- Alert on performance degradation

---

## Quick Reporting Template

Copy this template when reporting errors:

```
**Error Report**

Error: [error message]
URL: [page/endpoint]
Sentry: [Sentry issue link]
Context: [what you were doing]
Steps to Reproduce: [if known]
Priority: [Critical/Important/Low]
```

---

## Tips

1. **Check Sentry Daily** (or set up alerts)
2. **Report Critical Errors Immediately**
3. **Include Sentry Links** - Makes debugging faster
4. **Note User Impact** - How many users affected?
5. **Check Error Frequency** - Is it happening often?

---

**I'll fix errors as you report them!** 🐛→✅

