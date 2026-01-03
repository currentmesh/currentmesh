# Service Monitoring & Auto-Recovery

## Overview
Automated monitoring system to prevent 502 Bad Gateway errors and ensure service availability.

## Components

### 1. Health Check Endpoints
- **Marketing Site**: `/api/health` - Returns service status, uptime, and timestamp
- **API Server**: `/` - Basic root endpoint for health checks
- **Frontend Apps**: `/` - Root endpoints for basic connectivity checks

### 2. Nginx Enhancements
- **Upstream Health Checks**: Automatic failover with `max_fails` and `fail_timeout`
- **Enhanced Timeouts**: Increased timeouts for Next.js compilation (300s)
- **Retry Logic**: Automatic retry on 5xx errors with exponential backoff
- **Custom Error Pages**: User-friendly 502/503/504 error pages with auto-retry

### 3. PM2 Configuration Improvements
- **Increased Timeouts**: 
  - `min_uptime`: 60s (allows Next.js to fully compile)
  - `listen_timeout`: 20s (gives Next.js time to start)
  - `restart_delay`: 15s (prevents rapid restart loops)
- **Memory Limits**: Configured per service to prevent OOM crashes
- **Exponential Backoff**: Automatic restart delay increases on failures

### 4. Automated Monitoring Script
**Location**: `/var/www/currentmesh/scripts/monitor-services.sh`

**Features**:
- Checks PM2 process status
- Verifies port connectivity
- Tests health endpoints
- Auto-restarts unhealthy services
- Cooldown period (5 minutes) to prevent restart loops
- Maximum restart attempts (3) before requiring manual intervention
- Detailed logging to `/var/www/currentmesh/logs/service-monitor.log`

**Cron Schedule**: Runs every 5 minutes
```bash
*/5 * * * * /var/www/currentmesh/scripts/monitor-services.sh
```

## Manual Operations

### Check Service Status
```bash
pm2 status
```

### View Service Logs
```bash
pm2 logs currentmesh-marketing --lines 50
```

### Manual Health Check
```bash
curl http://localhost:3001/api/health
```

### Restart a Service
```bash
pm2 restart currentmesh-marketing
```

### Run Monitoring Script Manually
```bash
bash /var/www/currentmesh/scripts/monitor-services.sh
```

## Troubleshooting

### Service Keeps Restarting
1. Check logs: `pm2 logs <service-name>`
2. Check memory usage: `pm2 monit`
3. Review restart cooldown in monitoring script
4. Check for port conflicts: `netstat -tuln | grep <port>`

### Health Check Failing
1. Verify service is listening: `ss -tuln | grep <port>`
2. Test health endpoint directly: `curl http://localhost:<port>/api/health`
3. Check service startup time (Next.js can take 30-60s to compile)

### 502 Errors Persist
1. Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
2. Verify upstream is healthy: `curl http://localhost:<port>/api/health`
3. Check Nginx upstream configuration: `sudo nginx -T | grep upstream`
4. Restart Nginx: `sudo systemctl reload nginx`

## Monitoring Logs
- **Service Monitor**: `/var/www/currentmesh/logs/service-monitor.log`
- **Cron Output**: `/var/www/currentmesh/logs/service-monitor-cron.log`
- **PM2 Logs**: `/var/www/currentmesh/logs/<service-name>-*.log`

