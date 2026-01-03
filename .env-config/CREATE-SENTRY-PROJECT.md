# How to Create a Sentry Project

**Date**: 2025-12-31  
**Purpose**: Step-by-step guide to create Sentry project and get DSN

---

## Step-by-Step Guide

### Step 1: Log into Sentry
1. Go to: https://sentry.io/
2. Click **"Sign In"** or **"Log In"**
3. Enter your credentials

### Step 2: Create a New Project
1. Once logged in, you'll see your dashboard
2. Click **"Create Project"** button (usually in top right or center)
3. OR go to: https://sentry.io/organizations/[your-org]/projects/new/

### Step 3: Select Platform
Choose the platform for your project:
- **For Marketing Site**: Select **"Next.js"**
- **For Admin Dashboard**: Select **"React"** or **"Vite"**
- **For Backend API**: Select **"Node.js"** or **"Express"**

**Note**: You can create separate projects for each, or one project for all.

### Step 4: Configure Project
1. **Project Name**: Enter `currentmesh` (or `currentmesh-marketing`, `currentmesh-admin`, etc.)
2. **Team**: Select your team (or create one)
3. **Platform**: Already selected from Step 3
4. Click **"Create Project"**

### Step 5: Get Your DSN
After creating the project:
1. You'll see a setup page with your **DSN** (Data Source Name)
2. It looks like: `https://xxxxx@o0.ingest.sentry.io/xxxxx`
3. **Copy this DSN** - you'll need it for configuration

### Step 6: Get Organization and Project Slugs
1. **Organization Slug**: 
   - Go to Settings → Organization Settings
   - The slug is in the URL: `sentry.io/organizations/[org-slug]/`
   - Or check Organization Settings → General

2. **Project Slug**:
   - Go to your project
   - Check the URL: `sentry.io/organizations/[org]/projects/[project-slug]/`
   - Or go to Project Settings → General

---

## Recommended Setup

### Option 1: Single Project (Simpler)
Create one project called `currentmesh`:
- Use for all three applications (marketing, admin, backend)
- Differentiate using `environment` tags
- Easier to manage

### Option 2: Separate Projects (More Organized)
Create three projects:
- `currentmesh-marketing` (Next.js)
- `currentmesh-admin` (React/Vite)
- `currentmesh-api` (Node.js/Express)

---

## After Creating Project

### Update Environment File

```bash
cd /var/www/currentmesh
nano .env-config/.env
```

Update with your information:
```env
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here
SENTRY_ORG=your_org_slug_here
SENTRY_PROJECT=currentmesh
SENTRY_DSN=https://xxxxx@o0.ingest.sentry.io/xxxxx
```

### Get DSN for Each Project

**Marketing Site** (Next.js):
- Go to project → Settings → Client Keys (DSN)
- Copy the DSN
- Add to `marketing/.env.local` as `NEXT_PUBLIC_SENTRY_DSN`

**Admin Dashboard** (React/Vite):
- Go to project → Settings → Client Keys (DSN)
- Copy the DSN
- Add to `client/.env.local` as `VITE_SENTRY_DSN`

**Backend API** (Express.js):
- Go to project → Settings → Client Keys (DSN)
- Copy the DSN
- Add to `server/.env.local` as `SENTRY_DSN`

---

## Quick Links

- **Sentry Dashboard**: https://sentry.io/
- **Create Project**: https://sentry.io/organizations/[your-org]/projects/new/
- **Project Settings**: https://sentry.io/organizations/[your-org]/projects/[project]/settings/keys/

---

## What You'll Need

After creating the project, you'll have:
- ✅ **DSN**: For initializing Sentry in your apps
- ✅ **Organization Slug**: For API operations
- ✅ **Project Slug**: For API operations
- ✅ **API Token**: Already have it! ✅

---

**Ready to create your project?** Go to https://sentry.io/ and follow the steps above!

