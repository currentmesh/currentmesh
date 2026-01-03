#!/bin/bash
# Resource Monitoring Script - Prevents crashes from resource exhaustion
# Monitors disk space, memory, CPU, and takes preventive action

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/resource-monitor.log"

# Thresholds
DISK_WARNING=80  # Warn if disk usage > 80%
DISK_CRITICAL=90 # Critical if disk usage > 90%
MEM_WARNING=85   # Warn if memory usage > 85%
MEM_CRITICAL=95  # Critical if memory usage > 95%

mkdir -p "$PROJECT_ROOT/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_disk_space() {
    local USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$USAGE" -ge "$DISK_CRITICAL" ]; then
        log "🚨 CRITICAL: Disk usage at ${USAGE}% - Cleaning logs..."
        # Clean old logs (keep last 7 days)
        find "$PROJECT_ROOT/logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        find "$PROJECT_ROOT/logs" -name "*.log.*" -mtime +7 -delete 2>/dev/null || true
        # Clean PM2 old logs
        pm2 flush 2>/dev/null || true
        log "✅ Log cleanup complete"
        return 2
    elif [ "$USAGE" -ge "$DISK_WARNING" ]; then
        log "⚠️  WARNING: Disk usage at ${USAGE}%"
        return 1
    else
        log "✅ Disk usage: ${USAGE}% (OK)"
        return 0
    fi
}

check_memory() {
    local MEM_TOTAL=$(free -m | awk 'NR==2{print $2}')
    local MEM_USED=$(free -m | awk 'NR==2{print $3}')
    local MEM_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
    
    if [ "$MEM_PERCENT" -ge "$MEM_CRITICAL" ]; then
        log "🚨 CRITICAL: Memory usage at ${MEM_PERCENT}%"
        # Restart services with high memory usage
        pm2 list | awk '$10 > 500 {print $2}' | while read service; do
            if [ -n "$service" ] && [ "$service" != "name" ]; then
                log "🔄 Restarting high-memory service: $service"
                pm2 restart "$service" || true
            fi
        done
        return 2
    elif [ "$MEM_PERCENT" -ge "$MEM_WARNING" ]; then
        log "⚠️  WARNING: Memory usage at ${MEM_PERCENT}%"
        return 1
    else
        log "✅ Memory usage: ${MEM_PERCENT}% (OK)"
        return 0
    fi
}

check_service_health() {
    local UNHEALTHY=0
    
    # Check PM2 services
    while read -r line; do
        if echo "$line" | grep -qE "errored|stopped"; then
            local SERVICE=$(echo "$line" | awk '{print $2}')
            log "⚠️  Service $SERVICE is not healthy - restarting..."
            pm2 restart "$SERVICE" || pm2 start "$SERVICE" || true
            UNHEALTHY=1
        fi
    done < <(pm2 jlist | jq -r '.[] | "\(.pm2_env.status) \(.name)"' 2>/dev/null || pm2 list)
    
    if [ "$UNHEALTHY" -eq 0 ]; then
        log "✅ All services healthy"
    fi
    
    return $UNHEALTHY
}

check_restart_loops() {
    local LOOP_DETECTED=0
    
    pm2 list | awk 'NR>3 {print $2, $10}' | while read -r service restarts; do
        if [ "$restarts" -gt 5 ]; then
            log "⚠️  Service $service has restarted $restarts times - investigating..."
            LOOP_DETECTED=1
        fi
    done
    
    return $LOOP_DETECTED
}

main() {
    log "🔍 Starting resource monitoring..."
    
    check_disk_space
    DISK_STATUS=$?
    
    check_memory
    MEM_STATUS=$?
    
    check_service_health
    HEALTH_STATUS=$?
    
    check_restart_loops
    LOOP_STATUS=$?
    
    if [ "$DISK_STATUS" -eq 2 ] || [ "$MEM_STATUS" -eq 2 ]; then
        log "🚨 CRITICAL issues detected - immediate action taken"
        return 1
    elif [ "$DISK_STATUS" -eq 1 ] || [ "$MEM_STATUS" -eq 1 ] || [ "$HEALTH_STATUS" -ne 0 ] || [ "$LOOP_STATUS" -ne 0 ]; then
        log "⚠️  Warnings detected"
        return 1
    else
        log "✅ All resources healthy"
        return 0
    fi
}

main


