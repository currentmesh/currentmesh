# Cloudflare API Quick Start Guide

## Step 1: Get Your Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use **"Edit zone DNS"** template
4. Configure:
   - **Token name**: `CurrentMesh DNS`
   - **Permissions**: Zone → DNS → Edit
   - **Zone Resources**: Include → Specific zone → `currentmesh.com`
5. Click **"Continue to summary"** → **"Create Token"**
6. **Copy the token** (you won't see it again!)

## Step 2: Get Your Zone ID

1. Go to: https://dash.cloudflare.com/
2. Select `currentmesh.com` domain
3. Scroll down on Overview page
4. Find **"Zone ID"** in right sidebar
5. Copy the Zone ID

## Step 3: Get Your Server IP

Your DigitalOcean droplet IP address. You can find it:
- In DigitalOcean dashboard
- Or run: `curl ifconfig.me`

## Step 4: Create .env File

```bash
cd /var/www/currentmesh
cp .cloudflare/.env.example .cloudflare/.env
nano .cloudflare/.env
```

Fill in:
```
CLOUDFLARE_API_TOKEN=your_token_here
CLOUDFLARE_ZONE_ID=your_zone_id_here
SERVER_IP=your_server_ip_here
```

## Step 5: Run Setup Script

```bash
# Using Python (recommended)
python3 /var/www/currentmesh/scripts/cloudflare-setup.py

# OR using Bash
bash /var/www/currentmesh/scripts/cloudflare-setup.sh
```

## What It Does

The script will create/update these DNS records:
- ✅ `currentmesh.com` → Your server IP (proxied)
- ✅ `www.currentmesh.com` → Your server IP (proxied)
- ✅ `app.currentmesh.com` → Your server IP (proxied)
- ✅ `api.currentmesh.com` → Your server IP (not proxied)

## Security

- `.cloudflare/.env` is gitignored (never commit tokens!)
- API token has limited permissions (DNS only)
- Token is scoped to `currentmesh.com` zone only

---

**Ready?** Create your `.cloudflare/.env` file and run the script!

