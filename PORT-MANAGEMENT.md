# CurrentMesh Port Management

**Last Updated**: 2026-01-02  
**Purpose**: Prevent port conflicts and ensure stable service deployment

---

## Port Assignments

| Port | Service | Description | Process Name |
|------|---------|-----------|--------------|
| **3000** | Backend API | Express.js server (TypeScript) | `currentmesh-server` |
| **3001** | Marketing Site | Next.js marketing website | `currentmesh-marketing` |
| **5000** | Main App | Vite + React admin dashboard | `currentmesh-app` |
| **5001** | Client Portal | Next.js client collaboration portal | `currentmesh-client` |
| **5002** | Admin Dashboard | Vite + React super admin dashboard | `currentmesh-admin` |

---

## Port Conflict Prevention

### Automatic Checks

Before starting services, always run:
```bash
./scripts/check-ports.sh
```

This script will:
- ✅ Check all CurrentMesh ports for conflicts
- ❌ Report any processes using our ports
- 🔍 Identify conflicting process IDs

### Manual Port Check

Check a specific port:
```bash
ss -tlnp | grep :3000
lsof -i:3000
```

### Kill Conflicts

If conflicts are found:
```bash
./scripts/kill-conflicts.sh
```

**⚠️ Warning**: This script will ask for confirmation before killing processes.

---

## Service Management

### Start All Services

```bash
./scripts/start-services.sh
```

This script:
1. ✅ Validates all ports are available
2. ✅ Checks PM2 installation
3. ✅ Stops existing services
4. ✅ Starts all services from `ecosystem.config.js`
5. ✅ Saves PM2 configuration

### PM2 Commands

```bash
# View status
pm2 list

# View logs
pm2 logs
pm2 logs currentmesh-server

# Monitor
pm2 monit

# Stop/Start
pm2 stop all
pm2 start all
pm2 restart all

# Delete
pm2 delete all
```

---

## Port Configuration

### Environment Variables

Each service has explicit port configuration in:
- `ecosystem.config.js` - PM2 configuration
- `.env.local` files (if needed)

### Backend Server (Port 3000)

**Location**: `ecosystem.config.js` → `currentmesh-server`
```javascript
env: {
  PORT: 3000,
  NODE_ENV: 'development'
}
```

**Also configured in**: `server/.env.local`

### Marketing Site (Port 3001)

**Location**: `ecosystem.config.js` → `currentmesh-marketing`
```javascript
env: {
  PORT: 3001,
  NODE_ENV: 'development'
}
```

**Also configured in**: `marketing/.env.local`

### Frontend Services (Ports 5000-5002)

**Location**: `ecosystem.config.js` → `currentmesh-app`, `currentmesh-client`, `currentmesh-admin`

Each has explicit `PORT` in environment configuration.

---

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
1. Check what's using the port: `ss -tlnp | grep :3000`
2. Kill the process: `kill <PID>` or use `./scripts/kill-conflicts.sh`
3. Restart services: `./scripts/start-services.sh`

### Service Won't Start

1. Check port availability: `./scripts/check-ports.sh`
2. Check PM2 logs: `pm2 logs <service-name>`
3. Check service status: `pm2 list`
4. Verify ecosystem config: `cat ecosystem.config.js`

### Multiple Instances Running

If you see duplicate services:
```bash
# Stop all
pm2 stop all
pm2 delete all

# Kill any remaining processes
pkill -f "tsx.*index"
pkill -f "next-server"
pkill -f "vite"

# Restart clean
./scripts/start-services.sh
```

---

## Best Practices

1. **Always use explicit ports** - Never rely on auto-port selection
2. **Check ports before starting** - Run `./scripts/check-ports.sh` first
3. **Use PM2 ecosystem config** - Don't start services manually
4. **Monitor service health** - Use `pm2 monit` regularly
5. **Document port changes** - Update this file if ports change

---

## Port Reservation

These ports are **reserved** for CurrentMesh services:
- `3000` - Backend API (critical)
- `3001` - Marketing Site
- `5000` - Main App
- `5001` - Client Portal
- `5002` - Admin Dashboard

**Do not** use these ports for other services or applications.

---

## Related Documentation

- `ecosystem.config.js` - PM2 service configuration
- `.ai/prd.md` - Product Requirements Document (Section 12.2, 13.1)
- `scripts/check-ports.sh` - Port conflict detection
- `scripts/kill-conflicts.sh` - Port conflict resolution
- `scripts/start-services.sh` - Service startup script


