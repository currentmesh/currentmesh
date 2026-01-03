# Cloudflare API Token Issue

**Status**: API token is invalid or doesn't have required permissions

---

## Current Issue

The API token `112vSPRZsF14r47YcbENej2NBot11ntI8M9N5XCP` is returning:
- **Error Code 1000**: "Invalid API Token"

This means either:
1. The token is incorrect/incomplete
2. The token was revoked
3. The token format is wrong

---

## Solution Options

### Option 1: Get a New API Token (Recommended)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use **"Edit zone DNS"** template OR create custom token with:
   - **Zone** → **DNS** → **Edit**
   - **Zone** → **Zone** → **Read**
   - **Zone** → **Zone Settings** → **Edit** (for SSL settings)
4. **Zone Resources**: Include → Specific zone → `currentmesh.com`
5. Copy the **full token** (it's long!)
6. Update `/var/www/currentmesh/.cloudflare/.env` with the new token

### Option 2: Configure Manually in Dashboard (Faster)

Since the API isn't working, configure these settings manually:

1. **SSL/TLS Mode**: 
   - Go to: SSL/TLS → Overview
   - Set to **"Full"**

2. **Always Use HTTPS**:
   - Go to: SSL/TLS → Edge Certificates
   - Enable **"Always Use HTTPS"**

3. **Purge Cache**:
   - Go to: Caching → Configuration
   - Click **"Purge Everything"**

---

## Required API Token Permissions

For full automation, the token needs:
- ✅ Zone → DNS → Edit
- ✅ Zone → Zone → Read
- ✅ Zone → Zone Settings → Edit (for SSL/TLS settings)
- ✅ Zone → Cache Purge → Purge (for cache clearing)

---

## Current Token Location

Token is stored in: `/var/www/currentmesh/.cloudflare/.env`

To update:
```bash
nano /var/www/currentmesh/.cloudflare/.env
# Update CLOUDFLARE_API_TOKEN= with new token
```

---

**Once you have a valid token with SSL permissions, I can configure everything automatically!**


