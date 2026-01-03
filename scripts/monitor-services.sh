#!/bin/bash
# Service monitoring and auto-restart script
# Monitors all CurrentMesh services and restarts them if they're down or unhealthy

set -e

LOG_FILE="/var/www/currentmesh/logs/service-monitor.log"
MAX_RESTART_ATTEMPTS=3
RESTART_COOLDOWN=300  # 5 minutes between restart attempts

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_service_health() {
    local service_name=$1
    local port=$2
    local health_endpoint=$3
    
    # Check if PM2 process exists
    local pm2_info=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$service_name\")" 2>/dev/null)
    
    if [ -z "$pm2_info" ]; then
        log "WARNING: Service $service_name is not in PM2"
        return 1
    fi
    
    local status=$(echo "$pm2_info" | jq -r ".pm2_env.status" 2>/dev/null || echo "unknown")
    
    if [ "$status" != "online" ]; then
        log "WARNING: Service $service_name status is $status"
        return 1
    fi
    
    # Check if port is listening (use ss instead of netstat for better compatibility)
    if ! ss -tuln 2>/dev/null | grep -q ":$port " && ! netstat -tuln 2>/dev/null | grep -q ":$port "; then
        log "WARNING: Service $service_name is not listening on port $port"
        return 1
    fi
    
    # Check health endpoint if provided
    if [ -n "$health_endpoint" ]; then
        local health_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 --connect-timeout 3 "http://localhost:$port$health_endpoint" 2>/dev/null || echo "000")
        if [ "$health_response" != "200" ]; then
            log "WARNING: Service $service_name health check failed (HTTP $health_response)"
            return 1
        fi
    fi
    
    return 0
}

restart_service() {
    local service_name=$1
    local restart_file="/tmp/${service_name}_restart_count"
    local last_restart_file="/tmp/${service_name}_last_restart"
    
    # Check restart cooldown
    if [ -f "$last_restart_file" ]; then
        local last_restart=$(cat "$last_restart_file")
        local current_time=$(date +%s)
        local time_since_restart=$((current_time - last_restart))
        
        if [ $time_since_restart -lt $RESTART_COOLDOWN ]; then
            local remaining=$((RESTART_COOLDOWN - time_since_restart))
            log "SKIP: Service $service_name was restarted $remaining seconds ago (cooldown active)"
            return 1
        fi
    fi
    
    # Check restart count
    local restart_count=0
    if [ -f "$restart_file" ]; then
        restart_count=$(cat "$restart_file")
    fi
    
    if [ $restart_count -ge $MAX_RESTART_ATTEMPTS ]; then
        log "ERROR: Service $service_name has exceeded max restart attempts ($MAX_RESTART_ATTEMPTS). Manual intervention required."
        return 1
    fi
    
    log "RESTART: Restarting service $service_name (attempt $((restart_count + 1))/$MAX_RESTART_ATTEMPTS)"
    
    pm2 restart "$service_name" || pm2 start ecosystem.config.js --only "$service_name"
    
    # Update restart tracking
    echo $((restart_count + 1)) > "$restart_file"
    date +%s > "$last_restart_file"
    
    # Reset restart count after cooldown period
    (sleep $RESTART_COOLDOWN && rm -f "$restart_file") &
    
    # Wait a bit for service to start
    sleep 10
    
    return 0
}

# Main monitoring loop
main() {
    log "INFO: Starting service health check"
    
    # Define services: name, port, health_endpoint
    declare -a services=(
        "currentmesh-server:3000:/"
        "currentmesh-marketing:3001:/api/health"
        "currentmesh-app:5000:/"
        "currentmesh-client:5001:/"
        "currentmesh-admin:5002:/"
    )
    
    local issues_found=0
    
    for service_config in "${services[@]}"; do
        IFS=':' read -r service_name port health_endpoint <<< "$service_config"
        
        if ! check_service_health "$service_name" "$port" "$health_endpoint"; then
            issues_found=$((issues_found + 1))
            restart_service "$service_name" || true
        else
            log "OK: Service $service_name is healthy"
        fi
    done
    
    if [ $issues_found -eq 0 ]; then
        log "INFO: All services are healthy"
    else
        log "WARNING: Found $issues_found service issue(s)"
    fi
}

# Run main function
main
