# CurrentMesh Stability Guide

**Last Updated**: 2026-01-02  
**Purpose**: Prevent common issues and ensure stable operation

---

## Quick Start

### Start All Services (Recommended)
```bash
./scripts/start-services.sh
```

This script:
1. ✅ Checks for port conflicts
2. ✅ Validates PM2 installation
3. ✅ Stops existing services
4. ✅ Starts all services from `ecosystem.config.js`
5. ✅ Saves PM2 configuration

### Check Service Health
```bash
./scripts/health-check.sh
```

### Check for Port Conflicts
```bash
./scripts/check-ports.sh
```

---

## Common Issues & Solutions

### 1. Port Conflicts

**Symptom**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Check what's using the port
./scripts/check-ports.sh

# Kill conflicts (with confirmation)
./scripts/kill-conflicts.sh

# Or manually
ss -tlnp | grep :3000
kill <PID>
```

### 2. Service Won't Start

**Symptom**: Service shows "errored" or "stopped" in PM2

**Solution**:
```bash
# Check logs
pm2 logs <service-name>

# Check port availability
./scripts/check-ports.sh

# Restart service
pm2 restart <service-name>

# If still failing, delete and restart
pm2 delete <service-name>
./scripts/start-services.sh
```

### 3. Service Keeps Restarting

**Symptom**: High restart count in `pm2 list`

**Solution**:
```bash
# Check logs for errors
pm2 logs <service-name> --lines 50

# Check for port conflicts
./scripts/check-ports.sh

# Check memory usage
pm2 monit

# Restart with clean state
pm2 delete <service-name>
./scripts/start-services.sh
```

### 4. Multiple Instances Running

**Symptom**: Multiple processes on same port

**Solution**:
```bash
# Stop all PM2 services
pm2 stop all
pm2 delete all

# Kill any orphaned processes
pkill -f "tsx.*index"
pkill -f "next-server"
pkill -f "vite"

# Start clean
./scripts/start-services.sh
```

### 5. Services Not Responding

**Symptom**: Port is open but service doesn't respond

**Solution**:
```bash
# Run health check
./scripts/health-check.sh

# Check PM2 status
pm2 list

# Check logs
pm2 logs <service-name>

# Restart service
pm2 restart <service-name>
```

---

## Port Management

### Standard Port Assignments

| Port | Service | Critical |
|------|---------|----------|
| 3000 | Backend API | ✅ Yes |
| 3001 | Marketing Site | No |
| 5000 | Main App | No |
| 5001 | Client Portal | No |
| 5002 | Admin Dashboard | No |

**See**: `PORT-MANAGEMENT.md` for complete details

### Port Conflict Prevention

1. **Always check ports before starting**:
   ```bash
   ./scripts/check-ports.sh
   ```

2. **Use PM2 ecosystem config**:
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Never start services manually**:
   ```bash
   # ❌ Don't do this
   cd server && npm start
   
   # ✅ Do this instead
   ./scripts/start-services.sh
   ```

---

## Service Management

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

### Service-Specific Commands

```bash
# Backend API
pm2 restart currentmesh-server
pm2 logs currentmesh-server

# Marketing Site
pm2 restart currentmesh-marketing
pm2 logs currentmesh-marketing

# Main App
pm2 restart currentmesh-app
pm2 logs currentmesh-app
```

---

## Health Monitoring

### Automated Health Checks

Run health check script:
```bash
./scripts/health-check.sh
```

This checks:
- ✅ PM2 service status
- ✅ Port availability
- ✅ Service responsiveness

### Manual Health Checks

```bash
# Backend API
curl http://localhost:3000/health

# Marketing Site
curl http://localhost:3001/

# Main App
curl http://localhost:5000/
```

---

## Best Practices

### 1. Always Use Scripts

✅ **Do**:
```bash
./scripts/start-services.sh
./scripts/check-ports.sh
./scripts/health-check.sh
```

❌ **Don't**:
```bash
cd server && npm start
cd marketing && npm run dev
```

### 2. Check Ports Before Starting

Always run port check first:
```bash
./scripts/check-ports.sh
```

### 3. Monitor Service Health

Regular health checks:
```bash
./scripts/health-check.sh
```

### 4. Use PM2 for Everything

All services should run via PM2:
```bash
pm2 start ecosystem.config.js
```

### 5. Check Logs Regularly

```bash
pm2 logs
pm2 monit
```

---

## Troubleshooting Workflow

1. **Check service status**:
   ```bash
   pm2 list
   ```

2. **Check for port conflicts**:
   ```bash
   ./scripts/check-ports.sh
   ```

3. **Check service health**:
   ```bash
   ./scripts/health-check.sh
   ```

4. **Check logs**:
   ```bash
   pm2 logs <service-name>
   ```

5. **Restart services**:
   ```bash
   ./scripts/start-services.sh
   ```

---

## Emergency Recovery

If everything is broken:

```bash
# 1. Stop all services
pm2 stop all
pm2 delete all

# 2. Kill all processes
pkill -f "tsx.*index"
pkill -f "next-server"
pkill -f "vite"

# 3. Check ports
./scripts/check-ports.sh

# 4. Start fresh
./scripts/start-services.sh

# 5. Verify health
./scripts/health-check.sh
```

---

## Related Documentation

- `PORT-MANAGEMENT.md` - Complete port management guide
- `ecosystem.config.js` - PM2 service configuration
- `.ai/prd.md` - Product Requirements Document
- `scripts/` - All management scripts


