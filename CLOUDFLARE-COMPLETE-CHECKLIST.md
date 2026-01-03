# Cloudflare Complete Configuration Checklist

**Date**: December 31, 2025  
**Status**: Configuration checklist for CurrentMesh domains

---

## ✅ Already Configured (via API)

1. **DNS Records** - All configured and pointing to `134.209.57.20`
   - ✅ `currentmesh.com` → 134.209.57.20 (Proxied)
   - ✅ `www.currentmesh.com` → 134.209.57.20 (Proxied)
   - ✅ `app.currentmesh.com` → 134.209.57.20 (Proxied)
   - ✅ `api.currentmesh.com` → 134.209.57.20 (DNS Only)

---

## ⚠️ Manual Configuration Required in Cloudflare Dashboard

### 1. SSL/TLS Settings (CRITICAL)

**Location**: SSL/TLS → Overview

**Required Settings:**
- [ ] **SSL/TLS encryption mode**: Set to **"Full"** (not "Full (strict)")
  - This allows Cloudflare to handle SSL termination
  - Your origin server can use HTTP (port 80)
  - Cloudflare automatically provides HTTPS to visitors

**Why "Full" and not "Full (strict)"?**
- "Full" = Cloudflare ↔ Origin can use HTTP (what we need)
- "Full (strict)" = Requires valid SSL cert on origin (we don't have one yet)

---

### 2. Always Use HTTPS (Recommended)

**Location**: SSL/TLS → Edge Certificates

**Settings:**
- [ ] **Always Use HTTPS**: Enable
  - Automatically redirects HTTP to HTTPS
  - Improves security and SEO

---

### 3. Automatic HTTPS Rewrites (Recommended)

**Location**: SSL/TLS → Edge Certificates

**Settings:**
- [ ] **Automatic HTTPS Rewrites**: Enable
  - Rewrites HTTP links to HTTPS in your pages
  - Prevents mixed content warnings

---

### 4. Minimum TLS Version (Security)

**Location**: SSL/TLS → Edge Certificates

**Settings:**
- [ ] **Minimum TLS Version**: Set to **TLS 1.2** (recommended)
  - TLS 1.0 and 1.1 are deprecated
  - TLS 1.2 is secure and widely supported

---

### 5. Browser Integrity Check (Security)

**Location**: Security → Settings

**Settings:**
- [ ] **Browser Integrity Check**: Enable (default)
  - Protects against bots and malicious requests
  - Usually enabled by default

---

### 6. Security Level (DDoS Protection)

**Location**: Security → Settings

**Settings:**
- [ ] **Security Level**: Set to **"Medium"** or **"High"**
  - "Medium" = Good balance (recommended)
  - "High" = More aggressive (may block legitimate traffic)
  - "Low" = Less protection

---

### 7. Caching Configuration (Performance)

**Location**: Caching → Configuration

**Settings:**
- [ ] **Caching Level**: Set to **"Standard"**
  - Balances performance and freshness
  - Good for dynamic content

**Cache Purge:**
- [ ] **Purge Everything** (if seeing old GoDaddy pages)
  - Clears all cached content
  - Use after making changes

---

### 8. Page Rules (Optional - Performance)

**Location**: Rules → Page Rules

**Optional Rules to Consider:**

**Rule 1: Cache Static Assets**
- URL: `*currentmesh.com/_next/static/*`
- Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

**Rule 2: Bypass Cache for API**
- URL: `api.currentmesh.com/*`
- Settings:
  - Cache Level: Bypass

---

### 9. Speed Optimization (Optional)

**Location**: Speed → Optimization

**Settings to Consider:**
- [ ] **Auto Minify**: Enable for HTML, CSS, JavaScript
  - Reduces file sizes
  - Improves load times

- [ ] **Brotli**: Enable
  - Better compression than gzip
  - Faster page loads

---

### 10. Network Settings

**Location**: Network

**Settings:**
- [ ] **HTTP/2**: Enable (usually default)
- [ ] **HTTP/3 (with QUIC)**: Enable (recommended)
- [ ] **0-RTT Connection Resumption**: Enable (recommended)
- [ ] **IPv6 Compatibility**: Enable (recommended)

---

### 11. Firewall Rules (Security - Optional)

**Location**: Security → WAF

**Consider Adding:**
- [ ] Rate limiting rules for API endpoints
- [ ] Geo-blocking if needed
- [ ] IP access rules if needed

---

## 🔍 Verification Steps

After configuring, verify everything works:

```bash
# Test HTTPS (should work after SSL config)
curl -I https://currentmesh.com

# Test HTTP (should redirect to HTTPS if "Always Use HTTPS" is enabled)
curl -I http://currentmesh.com

# Test subdomains
curl -I https://app.currentmesh.com
curl -I https://api.currentmesh.com

# Check SSL certificate
openssl s_client -connect currentmesh.com:443 -servername currentmesh.com < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

---

## 📋 Quick Configuration Summary

**Minimum Required:**
1. ✅ SSL/TLS mode: "Full"
2. ✅ Always Use HTTPS: Enable
3. ✅ Purge cache (if seeing old pages)

**Recommended:**
4. ✅ Automatic HTTPS Rewrites: Enable
5. ✅ Minimum TLS: 1.2
6. ✅ Security Level: Medium
7. ✅ HTTP/3: Enable
8. ✅ Auto Minify: Enable

---

## 🚨 Common Issues

### Issue: Still seeing GoDaddy page
**Solution:**
1. Purge Cloudflare cache
2. Clear browser cache
3. Wait 5-15 minutes for DNS propagation
4. Check DNS records are Proxied (orange cloud)

### Issue: 502 Bad Gateway
**Solution:**
1. Check if app is running: `pm2 status`
2. Check if port 3000 is listening: `ss -tlnp | grep :3000`
3. Check nginx is running: `systemctl status nginx`
4. Check nginx error logs: `tail -f /var/log/nginx/error.log`

### Issue: SSL errors
**Solution:**
1. Verify SSL mode is set to "Full" (not "Full (strict)")
2. Check origin server is accessible on HTTP (port 80)
3. Verify DNS records are Proxied

---

## 📝 Notes

1. **SSL Mode "Full"** is required because:
   - Your origin server (nginx) uses HTTP (port 80)
   - Cloudflare handles SSL termination
   - No SSL certificate needed on your server

2. **DNS Proxied vs DNS Only:**
   - Proxied (orange cloud) = Traffic goes through Cloudflare (recommended for most)
   - DNS Only (gray cloud) = Direct to origin (for API if needed)

3. **Cache Purge:**
   - Use "Purge Everything" sparingly
   - Use "Custom Purge" for specific URLs when possible
   - Cache helps performance but can show old content

4. **Performance vs Freshness:**
   - Higher cache = Better performance, but may show stale content
   - Lower cache = Fresh content, but slower
   - Balance based on your needs

---

**Once SSL mode is set to "Full" and cache is purged, your site should be accessible!**


