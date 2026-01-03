# Sentry Implementation Guide - Maximizing Usage

**Date**: 2025-12-31  
**Status**: Enhanced Sentry integration across all projects

---

## ✅ Enhancements Added

### 1. Backend Enhancements

#### Performance Monitoring
- ✅ Transaction tracking for API routes
- ✅ Database query performance tracking
- ✅ Custom spans for business logic
- ✅ External API call tracking

#### User Context
- ✅ Automatic user context from JWT
- ✅ Organization/tenant tracking
- ✅ Request ID tracking

#### Breadcrumbs
- ✅ Automatic HTTP request breadcrumbs
- ✅ Custom breadcrumbs for business events
- ✅ Error context breadcrumbs

#### Custom Tags & Metadata
- ✅ Request method, path, IP
- ✅ Organization ID
- ✅ Error types
- ✅ Custom business tags

**Files Created**:
- `server/src/middleware/sentry.middleware.ts` - Sentry middleware
- `server/src/utils/sentry-helpers.ts` - Helper functions
- `server/src/db/queries/example-with-sentry.ts` - Example queries

---

### 2. Frontend Enhancements (Admin Dashboard)

#### Error Boundaries
- ✅ React Error Boundary component
- ✅ Sentry integration
- ✅ User-friendly error messages

#### Performance Monitoring
- ✅ Browser performance tracking
- ✅ Interaction to Next Paint (INP)
- ✅ Navigation tracking

#### User Context
- ✅ User information tracking
- ✅ Organization tracking
- ✅ Page view tracking

#### Breadcrumbs
- ✅ Console logs as breadcrumbs
- ✅ Navigation breadcrumbs
- ✅ API call breadcrumbs
- ✅ User action breadcrumbs

**Files Created**:
- `client/src/lib/sentry-helpers.ts` - Helper functions
- `client/src/components/ErrorBoundary.tsx` - Error boundary
- `client/src/hooks/useSentry.ts` - React hooks

---

### 3. Marketing Site Enhancements

#### Enhanced Configuration
- ✅ Console log capture
- ✅ Performance monitoring
- ✅ Error filtering
- ✅ Release tracking

**Files Updated**:
- `marketing/sentry.client.config.ts` - Enhanced config
- `marketing/sentry.server.config.ts` - Enhanced config

---

### 4. Release Tracking

#### Script Created
- ✅ `scripts/sentry-release.sh` - Automated release tracking
- ✅ Git commit-based versions
- ✅ Deployment tracking

---

## Usage Examples

### Backend: Track Database Query

```typescript
import { trackDatabaseQuery } from '../utils/sentry-helpers';

const request = await trackDatabaseQuery('getRequestById', async () => {
  return await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
});
```

### Backend: Track External API

```typescript
import { trackExternalAPI } from '../utils/sentry-helpers';

const data = await trackExternalAPI('SendGrid Email', async () => {
  return await sendgrid.sendEmail(email);
});
```

### Backend: Add Custom Breadcrumb

```typescript
import { addBreadcrumb } from '../utils/sentry-helpers';

addBreadcrumb('Request status changed', 'business', 'info', {
  requestId: '123',
  oldStatus: 'pending',
  newStatus: 'completed',
});
```

### Frontend: Use Error Boundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Frontend: Track User Actions

```tsx
import { useSentryAction } from '@/hooks/useSentry';

function MyComponent() {
  const { trackAction } = useSentryAction();

  const handleClick = () => {
    trackAction('button_clicked', { buttonId: 'submit' });
    // ... your logic
  };
}
```

### Frontend: Track Navigation

```tsx
import { useSentryPageView } from '@/hooks/useSentry';

function MyPage() {
  useSentryPageView(window.location.pathname);
  // ... component
}
```

---

## Best Practices

### 1. Always Set User Context
```typescript
// Backend: After authentication
Sentry.setUser({
  id: user.id,
  email: user.email,
  organizationId: user.organizationId,
});
```

### 2. Add Breadcrumbs for Important Events
```typescript
// Track business events
addBreadcrumb('Document uploaded', 'business', 'info', {
  documentId: '123',
  fileSize: '5MB',
});
```

### 3. Use Custom Tags for Filtering
```typescript
Sentry.setTag('feature', 'request_management');
Sentry.setTag('environment', 'production');
```

### 4. Track Performance for Slow Operations
```typescript
// Database queries
await trackDatabaseQuery('complexQuery', async () => {
  // Your query
});

// External APIs
await trackExternalAPI('thirdPartyService', async () => {
  // Your API call
});
```

### 5. Filter Out Non-Critical Errors
Already configured in Sentry init to ignore:
- Network errors (user offline)
- Connection refused errors
- Known non-critical errors

---

## Monitoring Dashboard

### Key Metrics to Watch

1. **Error Rate**: Should be < 0.1%
2. **Response Time**: API < 500ms (95th percentile)
3. **Database Query Time**: < 100ms
4. **Error Frequency**: Track by error type
5. **User Impact**: Errors per user

### Custom Alerts

Set up in Sentry Dashboard:
- Error rate > 1%
- Response time > 1s
- Database query time > 500ms
- New error types

---

## Release Tracking

### Manual Release
```bash
./scripts/sentry-release.sh v1.0.0
```

### Automatic Release (in CI/CD)
```bash
./scripts/sentry-release.sh $(git rev-parse --short HEAD)
```

---

## What You Get

### Error Tracking
- ✅ Full stack traces
- ✅ User context
- ✅ Breadcrumbs
- ✅ Custom tags
- ✅ Release tracking

### Performance Monitoring
- ✅ API route performance
- ✅ Database query performance
- ✅ External API performance
- ✅ Frontend performance (LCP, FID, CLS, INP)

### User Experience
- ✅ Session replay (10% sessions, 100% errors)
- ✅ User action tracking
- ✅ Navigation tracking

### Debugging
- ✅ Source maps (when configured)
- ✅ Breadcrumb trail
- ✅ Custom context
- ✅ Error grouping

---

## Next Steps

1. **Upload Source Maps** (for production)
   - Configure in build process
   - Upload to Sentry during deployment

2. **Set Up Alerts**
   - Go to Sentry Dashboard
   - Configure alert rules
   - Set up notifications (email, Slack, etc.)

3. **Monitor Performance**
   - Check transaction performance
   - Identify slow queries
   - Optimize based on data

4. **Review Errors Regularly**
   - Check Sentry dashboard daily
   - Fix high-frequency errors
   - Improve error messages

---

**Sentry is now maximized across all projects!** 🎉

You'll get comprehensive error tracking, performance monitoring, and debugging capabilities.

