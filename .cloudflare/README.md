# Cloudflare API Setup

**Purpose**: Configure Cloudflare DNS records for CurrentMesh subdomains

---

## How to Get Cloudflare API Token

### Step 1: Log into Cloudflare
1. Go to https://dash.cloudflare.com/
2. Log in with your account

### Step 2: Create API Token
1. Click on your profile icon (top right)
2. Select **"My Profile"**
3. Go to **"API Tokens"** tab
4. Click **"Create Token"**

### Step 3: Use Edit Zone DNS Template
1. Click **"Get started"** on **"Edit zone DNS"** template
2. Or create custom token with these permissions:
   - **Zone** → **DNS** → **Edit**
   - **Zone** → **Zone** → **Read**

### Step 4: Configure Token
1. **Token name**: `CurrentMesh DNS Management`
2. **Permissions**: 
   - Zone → DNS → Edit
   - Zone → Zone → Read
3. **Zone Resources**: 
   - Include → Specific zone → `currentmesh.com`
4. Click **"Continue to summary"**
5. Click **"Create Token"**

### Step 5: Copy Token
1. **IMPORTANT**: Copy the token immediately (you won't see it again!)
2. Save it securely

---

## Required Information

To configure Cloudflare DNS, I need:

1. **Cloudflare API Token** (from above steps)
2. **Zone ID** (found in Cloudflare dashboard → currentmesh.com → Overview → Zone ID)
3. **Server IP Address** (your DigitalOcean droplet IP)

---

## Where to Find Zone ID

1. Go to Cloudflare Dashboard
2. Select `currentmesh.com` domain
3. Scroll down on Overview page
4. Find **"Zone ID"** in the right sidebar
5. Copy the Zone ID

---

## Security Notes

- **NEVER** commit API tokens to Git
- Store tokens in `.cloudflare/.env` (gitignored)
- Use environment variables for tokens
- Rotate tokens periodically

---

## Next Steps

Once you have:
1. Cloudflare API Token
2. Zone ID
3. Server IP Address

I can help you:
- Create DNS A records for subdomains
- Configure SSL/TLS settings
- Set up proxy status
- Configure DNS records for:
  - `currentmesh.com` → Marketing site
  - `app.currentmesh.com` → Admin dashboard
  - `api.currentmesh.com` → Backend API (optional)

---

**End of Setup Guide**

