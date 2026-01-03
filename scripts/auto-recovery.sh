#!/bin/bash
# Automated Recovery Script
# Monitors services and automatically recovers from common issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check for excessive restarts
check_restart_loop() {
    local SERVICE_NAME=$1
    local MAX_RESTARTS=20
    
    RESTART_COUNT=$(pm2 jlist | python3 -c "
import sys, json
data = json.load(sys.stdin)
for app in data:
    if app['name'] == '$SERVICE_NAME':
        print(app['pm2_env']['restart_time'])
        break
" 2>/dev/null || echo "0")
    
    if [ "$RESTART_COUNT" -gt "$MAX_RESTARTS" ]; then
        log "⚠️  $SERVICE_NAME has restarted $RESTART_COUNT times (max: $MAX_RESTARTS)"
        return 1
    fi
    
    return 0
}

# Check for port conflicts
check_port_conflicts() {
    if ! "$SCRIPT_DIR/check-ports.sh" > /dev/null 2>&1; then
        log "⚠️  Port conflicts detected"
        "$SCRIPT_DIR/kill-conflicts.sh"
        return 1
    fi
    return 0
}

# Main recovery function
main() {
    log "🔧 Starting automated recovery check..."
    
    # Check port conflicts first
    if ! check_port_conflicts; then
        log "✅ Port conflicts resolved"
    fi
    
    # Check each service for restart loops
    SERVICES=("currentmesh-server" "currentmesh-marketing" "currentmesh-app" "currentmesh-client" "currentmesh-admin")
    
    for SERVICE in "${SERVICES[@]}"; do
        if ! check_restart_loop "$SERVICE"; then
            log "🔄 Restarting $SERVICE to break restart loop..."
            pm2 delete "$SERVICE" 2>/dev/null || true
            sleep 2
            pm2 start ecosystem.config.js --only "$SERVICE"
            log "✅ $SERVICE restarted"
        fi
    done
    
    # Run health check
    "$SCRIPT_DIR/health-check.sh" || {
        log "⚠️  Health check failed, attempting recovery..."
        "$SCRIPT_DIR/monitor-services.sh"
    }
    
    log "✅ Recovery check complete"
}

main


