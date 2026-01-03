# CurrentMesh Setup Complete ✅

**Date**: 2025-12-31  
**Status**: Both projects cloned and ready for setup

---

## Project Structure

```
/var/www/currentmesh/
├── client/              # Admin Dashboard → app.currentmesh.com
│   └── (shadcn admin template)
├── marketing/           # Marketing Site → currentmesh.com
│   └── (Magic UI Next.js app)
└── server/              # Backend API (to be created)
```

---

## 1. Marketing Site (currentmesh.com)

**Location**: `/var/www/currentmesh/marketing/`  
**Template**: Magic UI Next.js App  
**Source**: https://github.com/magicuidesign/magicui.git (apps/www)

**Setup**:
```bash
cd /var/www/currentmesh/marketing
npm install
# OR
pnpm install
```

**Start Development**:
```bash
npm run dev
# Runs on http://localhost:3000
```

**Build for Production**:
```bash
npm run build
npm start
```

**Tech Stack**:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Magic UI animated components

---

## 2. Admin Dashboard (app.currentmesh.com)

**Location**: `/var/www/currentmesh/client/`  
**Template**: Shadcn Admin  
**Source**: https://github.com/satnaing/shadcn-admin.git

**Setup**:
```bash
cd /var/www/currentmesh/client
npm install
# OR
pnpm install
```

**Start Development**:
```bash
npm run dev
# Runs on http://localhost:5173 (Vite default)
```

**Build for Production**:
```bash
npm run build
# Output in dist/ directory
```

**Tech Stack**:
- Vite + React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- TanStack Router
- React Hook Form + Zod

---

## Next Steps

### 1. Install Dependencies

**Marketing Site**:
```bash
cd /var/www/currentmesh/marketing
npm install
```

**Admin Dashboard**:
```bash
cd /var/www/currentmesh/client
npm install
```

### 2. Customize Projects

**Marketing Site**:
- Update branding to CurrentMesh
- Customize content in `app/` directory
- Modify components in `components/` directory
- Update `package.json` name to "currentmesh-marketing"

**Admin Dashboard**:
- Update branding to CurrentMesh
- Customize dashboard content
- Modify components as needed
- Update `package.json` name to "currentmesh-client"

### 3. Environment Setup

**Marketing Site** (`.env.local`):
```env
NEXT_PUBLIC_SITE_URL=https://currentmesh.com
```

**Admin Dashboard** (`.env.local`):
```env
VITE_API_URL=http://localhost:3000
VITE_SITE_URL=https://app.currentmesh.com
```

### 4. Backend API Setup

Create `/var/www/currentmesh/server/` directory:
```bash
mkdir -p /var/www/currentmesh/server
# Set up Express.js backend
```

### 5. Nginx Configuration

Configure Nginx for subdomains:
- `currentmesh.com` → Marketing site (Next.js)
- `app.currentmesh.com` → Admin dashboard (Vite build)

---

## Domain Mapping

| Domain | Directory | Framework | Port (Dev) |
|--------|-----------|-----------|------------|
| `currentmesh.com` | `/var/www/currentmesh/marketing` | Next.js | 3000 |
| `app.currentmesh.com` | `/var/www/currentmesh/client` | Vite + React | 5173 |
| `api.currentmesh.com` | `/var/www/currentmesh/server` | Express.js | 3000 |

---

## Development Commands

### Marketing Site
```bash
cd /var/www/currentmesh/marketing
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Lint code
```

### Admin Dashboard
```bash
cd /var/www/currentmesh/client
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Lint code
```

---

## Notes

1. **Marketing Site**: Currently set up as Magic UI documentation site. You'll need to customize it for CurrentMesh marketing content.

2. **Admin Dashboard**: Shadcn Admin template is ready. Customize for CurrentMesh features (request management, workpapers, etc.).

3. **Package Managers**: Both projects support npm and pnpm. Use whichever you prefer.

4. **Git**: Both directories have their own `.git` folders. You may want to:
   - Remove `.git` folders and track in main repository
   - OR keep separate repos for each project

---

## Status

✅ Marketing site cloned (Magic UI)  
✅ Admin dashboard cloned (Shadcn Admin)  
⏳ Dependencies installation (pending)  
⏳ Customization (pending)  
⏳ Backend API setup (pending)  
⏳ Nginx configuration (pending)  

---

**End of Setup Summary**

