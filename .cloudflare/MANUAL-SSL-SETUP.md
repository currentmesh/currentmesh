# Manual Cloudflare SSL Setup Guide

**Date**: 2025-12-31  
**Note**: API token doesn't have SSL permissions - manual setup required

---

## Quick Setup (2 minutes)

### Step 1: Go to Cloudflare Dashboard
1. Visit: https://dash.cloudflare.com/
2. Select **`currentmesh.com`** domain

### Step 2: Navigate to SSL/TLS Settings
1. Click **"SSL/TLS"** in the left sidebar
2. You'll see the encryption mode section

### Step 3: Set SSL Mode to "Full"
1. Find **"Encryption mode"** dropdown
2. Select **"Full"**
3. Click **"Save"** (if needed)

---

## SSL Mode Options

### Recommended: **Full**
- ✅ Cloudflare handles SSL (visitor → Cloudflare is HTTPS)
- ✅ Origin can use HTTP (Cloudflare → your server)
- ✅ No certificates needed on your server
- ✅ Works immediately

### Alternative: **Full (strict)**
- ✅ End-to-end encryption
- ✅ Requires valid SSL certificate on your server
- ⚠️ Need to run Certbot for Let's Encrypt certificates

---

## What "Full" Mode Does

```
┌─────────┐    HTTPS     ┌──────────────┐    HTTP     ┌──────────┐
│ Visitor │ ────────────> │  Cloudflare  │ ──────────> │  Nginx   │
│         │ <──────────── │  (SSL Proxy) │ <────────── │ (Port 80)│
└─────────┘    HTTPS     └──────────────┘    HTTP     └──────────┘
```

1. **Visitor → Cloudflare**: HTTPS (encrypted)
2. **Cloudflare → Your Server**: HTTP (Cloudflare handles SSL termination)
3. **Your Server**: Just needs to listen on HTTP (port 80)

---

## Verify SSL is Working

After setting to "Full", test your domains:

```bash
# Test HTTPS access
curl -I https://currentmesh.com
curl -I https://app.currentmesh.com
curl -I https://api.currentmesh.com

# Check SSL certificate
openssl s_client -connect currentmesh.com:443 -servername currentmesh.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

You should see:
- ✅ HTTP 200 or 301/302 responses
- ✅ Valid SSL certificates
- ✅ Certificate issued by Cloudflare

---

## Current Nginx Configuration

Your Nginx is already configured for HTTP (port 80), which is perfect for "Full" mode:

- ✅ `currentmesh.com` → HTTP on port 80
- ✅ `app.currentmesh.com` → HTTP on port 80
- ✅ `api.currentmesh.com` → HTTP on port 80

**No changes needed!** Cloudflare handles SSL automatically.

---

## Troubleshooting

### SSL not working?
1. Check SSL mode is set to "Full" in Cloudflare
2. Wait 1-2 minutes for changes to propagate
3. Clear browser cache
4. Check DNS is pointing to Cloudflare (orange cloud icon)

### Want end-to-end encryption?
1. Set SSL mode to "Full (strict)"
2. Run: `sudo /var/www/currentmesh/scripts/ssl-setup.sh`
3. This gets Let's Encrypt certificates for your server

---

## Summary

✅ **Set SSL mode to "Full" in Cloudflare Dashboard**  
✅ **Nginx already configured for HTTP (perfect!)**  
✅ **SSL will work automatically**  
✅ **No certificates needed on your server**

---

**That's it!** Your sites will be accessible via HTTPS once you set the mode to "Full" in the Cloudflare dashboard.

