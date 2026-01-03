# CurrentMesh Architecture Recommendations

**Date**: 2025-12-31  
**Purpose**: Project structure and deployment architecture

---

## Recommended Architecture

### Domain Structure

```
currentmesh.com          → Marketing site (Next.js + Magic UI)
app.currentmesh.com      → Admin dashboard (Vite + React + shadcn/ui)
api.currentmesh.com      → Backend API (Node.js + Express) [Optional]
```

### Directory Structure

```
/var/www/currentmesh/
├── client/              # Admin dashboard (Vite + React + shadcn/ui)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── marketing/           # Marketing site (Next.js + Magic UI + shadcn/ui)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── next.config.js
├── server/              # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── .ai/                 # Project documentation (PRD, ARCH, etc.)
└── README.md
```

---

## Subdomain vs Path Routing

### Option A: Subdomain (Recommended) ✅

**Structure**:
- `currentmesh.com` → Marketing site
- `app.currentmesh.com` → Admin dashboard

**Pros**:
- ✅ **Clear Separation**: Clean separation of concerns
- ✅ **Independent Deployment**: Deploy marketing and admin separately
- ✅ **Different Tech Stacks**: Next.js (marketing) vs Vite (admin) easily
- ✅ **Cookie Isolation**: Cookies don't mix between subdomains
- ✅ **Security**: Easier to apply different security policies
- ✅ **CDN/Caching**: Different caching strategies per subdomain
- ✅ **SSL**: Separate SSL certificates if needed
- ✅ **Professional**: Standard B2B SaaS pattern

**Cons**:
- Need to configure DNS for subdomain
- Need Nginx config for subdomain routing

**Nginx Configuration**:
```nginx
# Marketing site (currentmesh.com)
server {
    server_name currentmesh.com www.currentmesh.com;
    root /var/www/currentmesh/marketing/.next;
    # Next.js config
}

# Admin dashboard (app.currentmesh.com)
server {
    server_name app.currentmesh.com;
    root /var/www/currentmesh/client/dist;
    # Vite build output
}
```

---

### Option B: Path Routing

**Structure**:
- `currentmesh.com` → Marketing site
- `currentmesh.com/app` → Admin dashboard

**Pros**:
- ✅ **Single Domain**: Simpler DNS setup
- ✅ **Shared Cookies**: Easier cookie sharing if needed
- ✅ **Single SSL**: One certificate

**Cons**:
- ❌ **Complex Routing**: Need to handle routing in Next.js or Nginx
- ❌ **Mixed Stacks**: Harder to deploy Next.js + Vite together
- ❌ **Less Clean**: Path-based routing less professional
- ❌ **Deployment Complexity**: More complex build/deploy process

**Not Recommended** for CurrentMesh because:
- Different tech stacks (Next.js vs Vite)
- Different build processes
- Cleaner separation with subdomains

---

## Recommended Setup: Subdomain Architecture

### 1. Directory Structure

```
/var/www/currentmesh/
├── client/              # Admin dashboard
│   ├── src/
│   ├── dist/            # Vite build output
│   └── package.json
├── marketing/            # Marketing site
│   ├── app/
│   ├── .next/           # Next.js build output
│   └── package.json
└── server/               # Backend API
    ├── src/
    └── package.json
```

### 2. Deployment

**Marketing Site** (`currentmesh.com`):
- Next.js build: `npm run build`
- Deploy `.next` folder
- Nginx serves static/SSR from Next.js

**Admin Dashboard** (`app.currentmesh.com`):
- Vite build: `npm run build`
- Deploy `dist` folder
- Nginx serves static files

**Backend API**:
- Can use `api.currentmesh.com` or same domain with `/api` path
- PM2 manages Node.js process
- Nginx proxies to backend

### 3. Nginx Configuration Example

```nginx
# Marketing site - currentmesh.com
server {
    listen 80;
    listen [::]:80;
    server_name currentmesh.com www.currentmesh.com;
    
    location / {
        proxy_pass http://localhost:3001;  # Next.js dev server
        # OR serve static from .next/static and .next/server
    }
}

# Admin dashboard - app.currentmesh.com
server {
    listen 80;
    listen [::]:80;
    server_name app.currentmesh.com;
    
    root /var/www/currentmesh/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - api.currentmesh.com (optional)
server {
    listen 80;
    listen [::]:80;
    server_name api.currentmesh.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Development Setup

### Local Development

**Marketing Site**:
```bash
cd /var/www/currentmesh/marketing
npm run dev
# Runs on http://localhost:3001
```

**Admin Dashboard**:
```bash
cd /var/www/currentmesh/client
npm run dev
# Runs on http://localhost:5000 (as per PRD)
```

**Backend API**:
```bash
cd /var/www/currentmesh/server
PORT=3000 npm run dev
# Runs on http://localhost:3000
```

### Local Subdomain Setup (Development)

Add to `/etc/hosts`:
```
127.0.0.1 currentmesh.local
127.0.0.1 app.currentmesh.local
127.0.0.1 api.currentmesh.local
```

Or use `localhost` with different ports (simpler for development).

---

## Benefits of Subdomain Architecture

### 1. **Clean Separation**
- Marketing and admin are completely separate
- Easier to maintain and update independently

### 2. **Technology Flexibility**
- Marketing: Next.js (SSR, SEO)
- Admin: Vite + React (SPA, fast dev)
- Can change one without affecting the other

### 3. **Deployment Independence**
- Deploy marketing site updates without touching admin
- Deploy admin updates without touching marketing
- Different deployment schedules

### 4. **Security**
- Different security headers per subdomain
- Admin can have stricter security policies
- Marketing can be more open (SEO, public)

### 5. **Performance**
- Different caching strategies
- Marketing: CDN for static assets
- Admin: Aggressive caching for app assets

### 6. **Professional Standard**
- Standard B2B SaaS pattern
- Users expect `app.domain.com` for applications
- Clear mental model

---

## Migration Path

### Phase 1: Setup Structure
1. Create `client/` directory (admin dashboard)
2. Create `marketing/` directory (marketing site)
3. Keep `server/` directory (backend API)

### Phase 2: Development
1. Develop admin dashboard in `client/`
2. Develop marketing site in `marketing/`
3. Both connect to `server/` API

### Phase 3: Deployment
1. Configure DNS for subdomains
2. Set up Nginx configuration
3. Deploy each separately

---

## Final Recommendation

**✅ Use Subdomain Architecture**:
- `currentmesh.com` → Marketing site (Next.js + Magic UI)
- `app.currentmesh.com` → Admin dashboard (Vite + React + shadcn/ui)
- `api.currentmesh.com` → Backend API (optional, or use `/api` path)

**Directory Structure**:
```
/var/www/currentmesh/
├── client/          # Admin dashboard → app.currentmesh.com
├── marketing/       # Marketing site → currentmesh.com
└── server/          # Backend API
```

**Why This is Best**:
1. ✅ Clean separation of concerns
2. ✅ Independent deployment
3. ✅ Different tech stacks easily
4. ✅ Professional B2B pattern
5. ✅ Better security and performance
6. ✅ Easier maintenance

---

**End of Architecture Recommendations**

