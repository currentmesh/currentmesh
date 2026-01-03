# Git Branch Strategy for CurrentMesh Monorepo

## Overview

CurrentMesh is a **monorepo** containing multiple applications:
- `server/` - Backend API (Node.js/Express)
- `marketing/` - Marketing site (Next.js)
- `app/` - Main application (Vite/React)
- `admin/` - Super admin dashboard (Vite/React)
- `client/` - Client portal (Vite/React)

## Branch Strategy

### Protected Branches
- **`main`** - Production branch (protected, requires PR)
- **`dev`** - Development branch (protected, requires PR)

### Feature Branches
Create feature branches from `dev` for each story/epic:

**Format**: `feature/epic-{n}-story-{m}-{app}-{short-name}`

**Examples**:
```bash
# Feature affecting single app
feature/epic-1-story-2-admin-user-management
feature/epic-2-story-5-client-dashboard-update
feature/epic-3-story-1-server-auth-improvements

# Feature affecting multiple apps
feature/epic-1-story-3-shared-api-integration
feature/epic-2-story-7-auth-flow-update

# Cross-app features (use 'shared' or list apps)
feature/epic-1-story-4-shared-ui-components
feature/epic-2-story-6-app-admin-client-auth
```

### Bug Fix Branches
**Format**: `fix/epic-{n}-story-{m}-{app}-{bug-description}`

**Examples**:
```bash
fix/epic-1-story-2-admin-login-error
fix/epic-2-story-5-client-portal-crash
fix/epic-3-story-1-server-api-timeout
```

## Branch Naming Guidelines

### App Identifiers
- `server` - Backend changes
- `marketing` - Marketing site changes
- `app` - Main app changes
- `admin` - Admin dashboard changes
- `client` - Client portal changes
- `shared` - Changes affecting multiple apps or shared code

### When to Use Multiple App Identifiers
If a change affects multiple apps, you can:
1. Use `shared` if it's a common/shared change
2. List apps: `app-admin-client` (if affecting 3 apps)
3. Use `all` if it affects all apps

**Examples**:
```bash
feature/epic-1-story-2-shared-auth-middleware
feature/epic-2-story-5-app-client-api-update
fix/epic-3-story-1-all-ssl-configuration
```

## Workflow

### 1. Starting Work
```bash
# Always start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/epic-1-story-2-admin-user-management
```

### 2. Making Changes
- Work on your feature/fix
- Commit frequently with conventional commits
- Include app identifier in commit scope if helpful

**Commit Examples**:
```bash
feat(admin): add user management page
fix(server): resolve authentication timeout
feat(shared): add common UI components
refactor(app,client): update API client
```

### 3. Completing Work
```bash
# Push branch
git push origin feature/epic-1-story-2-admin-user-management

# Create PR to dev
gh pr create --base dev --title "feat(admin): User Management Page" --body "Implements user management for admin dashboard"
```

### 4. After PR Merge
```bash
# Update local dev
git checkout dev
git pull origin dev

# Delete feature branch
git branch -d feature/epic-1-story-2-admin-user-management
git push origin --delete feature/epic-1-story-2-admin-user-management
```

## Monorepo Best Practices

### ✅ DO
- Use descriptive branch names with app identifier
- Create branches from `dev`, not `main`
- Keep branches focused on single features/fixes
- Use conventional commits
- Reference epic/story numbers in branch names

### ❌ DON'T
- Don't create separate branches for each app (e.g., `admin-dev`, `client-dev`)
- Don't commit directly to `main` or `dev`
- Don't create branches from `main`
- Don't mix multiple unrelated features in one branch

## Deployment Strategy

### Development
- All feature branches → `dev` branch
- `dev` branch deployed to development environment

### Production
- `dev` → `main` (via PR after testing)
- `main` branch deployed to production

## Example Scenarios

### Scenario 1: Single App Feature
**Task**: Add user management page to admin dashboard

```bash
git checkout dev
git pull origin dev
git checkout -b feature/epic-1-story-2-admin-user-management

# Make changes in admin/
git add admin/
git commit -m "feat(admin): add user management page"
git push origin feature/epic-1-story-2-admin-user-management
```

### Scenario 2: Cross-App Feature
**Task**: Update authentication flow affecting app, admin, and client

```bash
git checkout dev
git pull origin dev
git checkout -b feature/epic-2-story-5-shared-auth-update

# Make changes in multiple apps
git add server/ app/ admin/ client/
git commit -m "feat(shared): update authentication flow across all apps"
git push origin feature/epic-2-story-5-shared-auth-update
```

### Scenario 3: Bug Fix
**Task**: Fix login error in client portal

```bash
git checkout dev
git pull origin dev
git checkout -b fix/epic-1-story-3-client-login-error

# Fix bug
git add client/
git commit -m "fix(client): resolve login authentication error"
git push origin fix/epic-1-story-3-client-login-error
```

## Summary

**You do NOT need separate branches for each app.**

Instead:
- Use **one branch per feature/fix**
- Include **app identifier** in branch name
- All branches merge to **`dev`** first
- `dev` merges to **`main`** for production

This keeps the repository clean and makes it easy to see what each branch affects.

