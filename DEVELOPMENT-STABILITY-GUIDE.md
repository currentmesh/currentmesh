# Development Stability Guide

**Last Updated**: 2026-01-02  
**Purpose**: Ensure stable development environment and prevent crashes

---

## 🚀 Quick Start

Before starting development work, run:

```bash
./scripts/development-stability-check.sh
```

This will check:
- ✅ PM2 services status
- ✅ Port conflicts
- ✅ Disk space
- ✅ Memory usage
- ✅ Service health
- ✅ Database connection
- ✅ Nginx status
- ✅ Recent errors

---

## 🛡️ Stability Measures Implemented

### 1. **Automated Monitoring**

**Health Checks** (Every 5 minutes):
- Service status verification
- Port availability checks
- Automatic service recovery

**Resource Monitoring** (Every 10 minutes):
- Disk space monitoring (warns at 80%, critical at 90%)
- Memory usage monitoring (warns at 85%, critical at 95%)
- Automatic log cleanup when disk is critical
- Service restart for high memory usage

**Recovery Checks** (Every 15 minutes):
- Restart loop detection
- Port conflict resolution
- Full service health validation

### 2. **Service Configuration**

**Enhanced PM2 Settings:**
- `min_uptime: 30s` - Prevents rapid restarts
- `max_restarts: 10-15` - Limits restart attempts
- `restart_delay: 10s` - Prevents restart storms
- `max_memory_restart` - Auto-restart on memory leaks
- `kill_timeout: 10s` - Graceful shutdown time
- `listen_timeout: 10-15s` - Wait for service startup

**Memory Limits:**
- Backend API: 512MB
- Marketing: 1800MB (reduced from 2500MB)
- App: 512MB
- Client: 800MB
- Admin: 512MB

### 3. **Log Management**

**Automated Cleanup:**
- Old logs deleted after 7 days
- PM2 logs flushed regularly
- Temp files cleaned weekly
- Disk space protected

**Log Rotation:**
- Daily rotation at 2 AM
- Compression enabled
- 14-day retention

### 4. **Error Prevention**

**Graceful Shutdown:**
- SIGTERM/SIGINT handlers
- Database connection cleanup
- HTTP server graceful close
- 5-10 second grace period

**Database Stability:**
- Connection retry with exponential backoff
- 10-second timeout (increased from 2s)
- Keep-alive connections
- Pool error handling

**Port Conflict Prevention:**
- Automated port conflict detection
- Process cleanup on conflicts
- Service restart on port issues

---

## 📊 Monitoring Commands

### Check Service Status
```bash
pm2 status
pm2 monit          # Real-time monitoring
pm2 logs           # View all logs
pm2 logs <service> # View specific service
```

### Run Health Checks
```bash
./scripts/monitor-services.sh      # Service health check
./scripts/monitor-resources.sh     # Resource monitoring
./scripts/auto-recovery.sh         # Full recovery check
./scripts/development-stability-check.sh  # Comprehensive check
```

### Check Resources
```bash
df -h /              # Disk space
free -h              # Memory
top                  # CPU/Memory usage
pm2 monit            # PM2 resource monitor
```

---

## 🔧 Troubleshooting

### Service Keeps Restarting

1. **Check logs:**
   ```bash
   pm2 logs <service-name> --lines 50
   ```

2. **Check for port conflicts:**
   ```bash
   ./scripts/check-ports.sh
   ```

3. **Run auto-recovery:**
   ```bash
   ./scripts/auto-recovery.sh
   ```

4. **Manual restart:**
   ```bash
   pm2 delete <service-name>
   pm2 start ecosystem.config.js --only <service-name>
   ```

### High Memory Usage

1. **Check memory:**
   ```bash
   free -h
   pm2 monit
   ```

2. **Restart high-memory services:**
   ```bash
   pm2 restart <service-name>
   ```

3. **Check for memory leaks:**
   ```bash
   pm2 logs <service-name> | grep -i "memory\|heap"
   ```

### Disk Space Issues

1. **Check disk usage:**
   ```bash
   df -h /
   ```

2. **Clean logs manually:**
   ```bash
   ./scripts/cleanup-logs.sh
   ```

3. **Clean PM2 logs:**
   ```bash
   pm2 flush
   ```

### Database Connection Issues

1. **Check API health:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check database connection:**
   ```bash
   curl http://localhost:3000/health | jq .database
   ```

3. **Restart API server:**
   ```bash
   pm2 restart currentmesh-server
   ```

---

## 🚨 Critical Alerts

The system will automatically:

- **Disk > 90%**: Clean logs immediately
- **Memory > 95%**: Restart high-memory services
- **Service Down**: Auto-restart with exponential backoff
- **Port Conflict**: Kill conflicting process and restart
- **Restart Loop**: Break loop and restart service

---

## 📝 Development Best Practices

### Before Starting Work

1. **Run stability check:**
   ```bash
   ./scripts/development-stability-check.sh
   ```

2. **Check service status:**
   ```bash
   pm2 status
   ```

3. **Monitor resources:**
   ```bash
   pm2 monit
   ```

### During Development

1. **Watch logs:**
   ```bash
   pm2 logs --lines 100
   ```

2. **Check for errors:**
   ```bash
   pm2 logs | grep -i error
   ```

3. **Monitor resources:**
   ```bash
   watch -n 5 'pm2 status && free -h'
   ```

### After Making Changes

1. **Restart affected services:**
   ```bash
   pm2 restart <service-name>
   ```

2. **Verify health:**
   ```bash
   ./scripts/monitor-services.sh
   ```

3. **Check for errors:**
   ```bash
   pm2 logs <service-name> --lines 20
   ```

---

## 🔄 Automated Maintenance

**Cron Schedule:**
- Health check: Every 5 minutes
- Resource monitoring: Every 10 minutes
- Recovery check: Every 15 minutes
- Log cleanup: Daily at 2 AM

**View Cron Logs:**
```bash
tail -f logs/monitor-cron.log
tail -f logs/recovery-cron.log
tail -f logs/resource-monitor.log
```

---

## ✅ Stability Checklist

Before starting development, ensure:

- [ ] All services running (`pm2 status` shows all online)
- [ ] No port conflicts (`./scripts/check-ports.sh`)
- [ ] Disk space > 20% free (`df -h /`)
- [ ] Memory usage < 85% (`free -h`)
- [ ] Database connected (`curl localhost:3000/health`)
- [ ] Nginx running (`systemctl status nginx`)
- [ ] No recent errors (`pm2 logs --lines 50`)
- [ ] Stability check passes (`./scripts/development-stability-check.sh`)

---

## 📚 Related Documentation

- [[STABILITY-IMPROVEMENTS.md]] - Detailed stability enhancements
- [[ADDITIONAL-STABILITY-IMPROVEMENTS.md]] - Additional improvements
- [[PORT-MANAGEMENT.md]] - Port assignments and management
- [[Troubleshooting Guide]] in PRD - Common issues and solutions

---

**Last Updated**: 2026-01-02


