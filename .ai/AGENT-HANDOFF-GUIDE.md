# Agent Handoff & Migration Guide

**Purpose**: Complete guide for new agent to restore CurrentMesh project on new DigitalOcean droplet  
**Date**: 2025-12-31  
**Status**: Comprehensive handoff documentation

---

## ⚠️ Critical: GitHub Alone is NOT Enough

**GitHub provides:**
- ✅ Code and project structure
- ✅ Documentation (PRD, guides)
- ✅ Configuration templates
- ✅ Git history

**GitHub does NOT provide:**
- ❌ Environment variables (`.env` files are gitignored)
- ❌ API keys and secrets
- ❌ Database credentials
- ❌ Server configurations
- ❌ Installed system packages
- ❌ MCP server configurations
- ❌ Cursor rules (if not committed)

---

## 📋 Complete Restoration Checklist

### 1. Server Setup (New Droplet)

#### Initial Server Configuration
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget build-essential

# Install Node.js (v20+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm globally
npm install -g pnpm

# Install PostgreSQL client (for Neon DB)
sudo apt install -y postgresql-client

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot (for SSL if not using Cloudflare)
sudo apt install -y certbot python3-certbot-nginx
```

#### Security Setup
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable

# SSH hardening (if needed)
# Edit /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PermitRootLogin prohibit-password
sudo systemctl restart sshd
```

---

### 2. Clone Repository

```bash
# Clone from GitHub
cd /var/www
git clone https://github.com/currentmesh/currentmesh.git
cd currentmesh

# Checkout dev branch
git checkout dev
```

---

### 3. Environment Variables Setup

#### Backend (`server/.env.local`)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_BAJL6D0WyUTQ@ep-spring-snow-af038yg8-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secrets (generate new ones for security)
JWT_SECRET=<generate_new_secret_64_chars>
JWT_REFRESH_SECRET=<generate_new_secret_64_chars>

# Sentry
SENTRY_DSN=https://0dedf871efa867ac8a3fd3894a4edad3@o4510628533370880.ingest.us.sentry.io/4510628617191424
SENTRY_WEBHOOK_SECRET=<optional_webhook_secret>

# File Storage (S3 or Spaces)
S3_BUCKET=your_bucket_name
S3_REGION=us-west-2
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Email (SendGrid/Brevo)
SENDGRID_API_KEY=your_sendgrid_api_key

# CORS
CORS_ORIGIN=http://localhost:5000,https://app.currentmesh.com,https://currentmesh.com
```

**Generate JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Admin (`client/.env.local`)
```env
VITE_SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
```

#### Marketing Site (`marketing/.env.local`)
```env
NEXT_PUBLIC_SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
```

#### Sentry Config (`.env-config/.env`)
```env
SENTRY_AUTH_TOKEN=<your_sentry_auth_token>
SENTRY_ORG=4510628533370880
SENTRY_PROJECT=currentmesh
SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
```

#### Cloudflare Config (`.cloudflare/.env`)
```env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
SERVER_IP=your_new_droplet_ip
```

---

### 4. Install Dependencies

```bash
# Backend
cd /var/www/currentmesh/server
npm install

# Frontend Admin
cd /var/www/currentmesh/client
npm install

# Marketing Site
cd /var/www/currentmesh/marketing
pnpm install
```

---

### 5. Database Setup

#### Run Migrations
```bash
cd /var/www/currentmesh/server
npm run dev
# Migrations run automatically on server start
```

#### Verify Database Connection
```bash
psql "postgresql://neondb_owner:npg_BAJL6D0WyUTQ@ep-spring-snow-af038yg8-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -c "SELECT current_database();"
```

---

### 6. MCP Server Configuration

#### Setup MCP Servers (`~/.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/root"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://neondb_owner:npg_BAJL6D0WyUTQ@ep-spring-snow-af038yg8-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    },
    "browser": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-browser"
      ]
    }
  }
}
```

---

### 7. Cursor Rules

#### Verify Cursor Rules
```bash
# Check if .cursorrules exists in project root
ls -la /var/www/currentmesh/.cursorrules

# If missing, it should be in GitHub
# If not in GitHub, copy from old server or recreate
```

---

### 8. Cloudflare DNS Configuration

#### Update DNS Records
```bash
# Use Cloudflare API or dashboard to update A records:
# currentmesh.com → new_droplet_ip
# app.currentmesh.com → new_droplet_ip
# api.currentmesh.com → new_droplet_ip

# Or use the script:
cd /var/www/currentmesh
./scripts/cloudflare-setup.sh
```

---

### 9. Nginx Configuration

#### Create Nginx Configs
```bash
# Use scripts in /var/www/currentmesh/scripts/
./scripts/nginx-setup-http.sh
./scripts/ssl-setup.sh  # If not using Cloudflare SSL
```

#### Or manually configure:
- `/etc/nginx/sites-available/currentmesh.com`
- `/etc/nginx/sites-available/app.currentmesh.com`
- `/etc/nginx/sites-available/api.currentmesh.com`

---

### 10. SSL Certificates

#### If using Let's Encrypt (not Cloudflare):
```bash
sudo certbot --nginx -d currentmesh.com -d app.currentmesh.com -d api.currentmesh.com
```

#### If using Cloudflare:
- Set SSL mode to "Full" in Cloudflare dashboard
- No certificates needed on server

---

### 11. PM2 Process Management

#### Setup PM2
```bash
# Start backend
cd /var/www/currentmesh/server
pm2 start npm --name "currentmesh-api" -- run dev

# Start frontend (if needed)
cd /var/www/currentmesh/client
pm2 start npm --name "currentmesh-client" -- run dev

# Save PM2 configuration
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

---

### 12. Sentry Webhook Configuration

#### Reconfigure Sentry Webhook
1. Go to Sentry Dashboard → Settings → Integrations → Event Hooks
2. Update webhook URL to new server IP:
   ```
   https://api.currentmesh.com/api/sentry/webhook
   ```
3. Verify webhook secret matches `SENTRY_WEBHOOK_SECRET` in backend `.env.local`

---

### 13. GitHub CLI Authentication

```bash
# Authenticate GitHub CLI
gh auth login

# Verify access
gh auth status
```

---

### 14. Verify Everything Works

#### Test Backend
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api
```

#### Test Frontend
```bash
# Admin dashboard
curl http://localhost:5000

# Marketing site (if running)
curl http://localhost:3001
```

#### Test Sentry Webhook
```bash
curl http://localhost:3000/api/test-sentry
curl http://localhost:3000/api/agent/errors
```

---

## 🔐 Secrets & Credentials Checklist

### Required Credentials (NOT in GitHub):

- [ ] **Database URL** (Neon PostgreSQL)
- [ ] **JWT Secrets** (generate new ones)
- [ ] **Sentry DSNs** (Frontend & Backend)
- [ ] **Sentry Auth Token** (for API access)
- [ ] **Sentry Webhook Secret** (optional)
- [ ] **Cloudflare API Token**
- [ ] **Cloudflare Zone ID**
- [ ] **S3/Spaces Credentials** (if using)
- [ ] **SendGrid API Key** (if using)
- [ ] **New Droplet IP Address**

---

## 📝 Quick Restoration Script

Create this script for new agent:

```bash
#!/bin/bash
# Quick restoration script for CurrentMesh

set -e

echo "🚀 Starting CurrentMesh restoration..."

# 1. Clone repo
cd /var/www
git clone https://github.com/currentmesh/currentmesh.git
cd currentmesh
git checkout dev

# 2. Install system dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential nodejs npm postgresql-client nginx
npm install -g pnpm pm2

# 3. Install project dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..
cd marketing && pnpm install && cd ..

# 4. Setup environment variables (manual step - agent needs to fill in)
echo "⚠️  IMPORTANT: Configure environment variables:"
echo "   - server/.env.local"
echo "   - client/.env.local"
echo "   - marketing/.env.local"
echo "   - .env-config/.env"
echo "   - .cloudflare/.env"

# 5. Setup MCP servers (manual step)
echo "⚠️  IMPORTANT: Configure MCP servers in ~/.cursor/mcp.json"

# 6. Setup Nginx
./scripts/nginx-setup-http.sh

# 7. Setup Cloudflare DNS
./scripts/cloudflare-setup.sh

# 8. Start services
cd server && pm2 start npm --name "currentmesh-api" -- run dev && cd ..
cd client && pm2 start npm --name "currentmesh-client" -- run dev && cd ..

echo "✅ Restoration complete! Verify environment variables and test services."
```

---

## 📚 Documentation to Review

New agent should read:
1. `.ai/prd.md` - Product Requirements Document
2. `.cursorrules` - Cursor rules and workflow
3. `.ai/SENTRY-IMPLEMENTATION-GUIDE.md` - Sentry setup
4. `.ai/AUTOMATED-ERROR-REPORTING.md` - Error reporting system
5. `INFRASTRUCTURE-COMPLETE.md` - Infrastructure overview

---

## ✅ Verification Checklist

After restoration, verify:
- [ ] Backend API responds (`/health`, `/api`)
- [ ] Database connection works
- [ ] Frontend builds successfully
- [ ] Marketing site builds successfully
- [ ] Nginx serves all sites
- [ ] SSL certificates valid (or Cloudflare SSL active)
- [ ] Sentry webhook receives errors
- [ ] Agent can query errors (`/api/agent/errors`)
- [ ] GitHub CLI authenticated
- [ ] MCP servers configured
- [ ] Cursor rules active

---

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Fails**
   - Verify `DATABASE_URL` in `server/.env.local`
   - Check Neon database is accessible
   - Verify network/firewall allows connection

2. **Sentry Errors Not Received**
   - Verify webhook URL in Sentry dashboard
   - Check `SENTRY_WEBHOOK_SECRET` matches
   - Verify backend is running and accessible

3. **Nginx 502 Errors**
   - Check backend is running on port 3000
   - Verify PM2 processes are active
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

4. **Build Failures**
   - Verify Node.js version (v20+)
   - Clear node_modules and reinstall
   - Check environment variables are set

---

## 📋 Summary

**GitHub provides**: Code, docs, config templates  
**You must provide**: Environment variables, API keys, credentials, server setup

**Minimum for new agent:**
1. GitHub access ✅
2. This handoff guide ✅
3. Environment variables document (secrets)
4. Database credentials
5. API keys (Sentry, Cloudflare, etc.)

**This guide + GitHub = Complete restoration** 🎯

