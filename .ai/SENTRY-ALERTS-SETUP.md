# Sentry Alerts Setup Guide

**Date**: 2025-12-31  
**Purpose**: Set up automated alerts so you don't have to manually check Sentry

---

## Why Set Up Alerts?

Instead of manually checking Sentry:
- ✅ Get notified when errors occur
- ✅ Get notified for critical issues only
- ✅ Save time - no need to check dashboards
- ✅ Faster response to issues

---

## How to Set Up Alerts

### Step 1: Go to Sentry Dashboard
1. Navigate to your Sentry organization
2. Go to **Settings** → **Alerts** → **Alert Rules**

### Step 2: Create Alert Rule

#### Example: Critical Errors Alert
- **Name**: "Critical Errors - CurrentMesh"
- **Conditions**:
  - When an issue is created
  - AND the issue level is `error` or `fatal`
  - AND the issue matches: `app:backend OR app:admin OR app:marketing`
- **Actions**: Send email notification

#### Example: High Error Rate Alert
- **Name**: "High Error Rate - CurrentMesh"
- **Conditions**:
  - When the error rate exceeds 1% in 5 minutes
  - AND the issue matches: `app:backend OR app:admin OR app:marketing`
- **Actions**: Send email notification

#### Example: New Error Type Alert
- **Name**: "New Error Type - CurrentMesh"
- **Conditions**:
  - When a new issue is created
  - AND the issue matches: `app:backend OR app:admin OR app:marketing`
- **Actions**: Send email notification

---

## Alert Channels

### Email (Easiest)
- ✅ Already configured
- ✅ Works immediately
- ✅ No setup needed

### Slack (Recommended)
1. Go to **Settings** → **Integrations** → **Slack**
2. Connect your Slack workspace
3. Choose channel for alerts
4. Test the integration

### Discord (Alternative)
1. Go to **Settings** → **Integrations** → **Discord**
2. Connect your Discord server
3. Choose channel for alerts

### Webhook (Advanced)
- Custom webhook URL
- Send to any service
- Full control over format

---

## Recommended Alert Rules

### 1. Critical Errors (Immediate)
```
Name: Critical Errors
Conditions:
  - Issue level: error or fatal
  - App: backend OR admin OR marketing
Actions:
  - Email: [your email]
  - Frequency: Every time
```

### 2. Error Rate Spike
```
Name: Error Rate Spike
Conditions:
  - Error rate > 1% in 5 minutes
  - App: backend OR admin OR marketing
Actions:
  - Email: [your email]
  - Frequency: Once per hour
```

### 3. New Error Types
```
Name: New Error Type
Conditions:
  - New issue created
  - App: backend OR admin OR marketing
Actions:
  - Email: [your email]
  - Frequency: Once per day (digest)
```

### 4. Performance Issues
```
Name: Slow API Responses
Conditions:
  - Transaction duration > 1 second
  - App: backend
Actions:
  - Email: [your email]
  - Frequency: Once per hour
```

---

## Alert Best Practices

### Don't Over-Alert
- ❌ Don't alert on every warning
- ❌ Don't alert on known issues
- ✅ Alert on critical errors only
- ✅ Use digest mode for non-critical

### Use Filters
- Filter by `app` tag
- Filter by error level
- Filter by environment (production only)

### Set Appropriate Frequency
- Critical: Every time
- Important: Once per hour
- Low priority: Daily digest

---

## Testing Alerts

1. **Create a test error**:
   ```bash
   curl http://localhost:3000/api/test-sentry
   ```

2. **Check your email/Slack**:
   - Should receive alert within seconds
   - Verify alert format
   - Check alert content

3. **Adjust if needed**:
   - Too many alerts? Add filters
   - Not enough? Lower thresholds
   - Wrong format? Customize message

---

## After Setup

Once alerts are configured:
1. **You'll get notified** when errors occur
2. **Forward alerts to me** with context
3. **I'll fix the errors** quickly

---

**Want me to help you set up specific alert rules?** Just let me know what you want to be notified about!

