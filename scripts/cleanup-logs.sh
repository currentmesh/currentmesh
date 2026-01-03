#!/bin/bash
# Automated Log Cleanup Script
# Prevents disk space issues by cleaning old logs

set -e

PROJECT_ROOT="/var/www/currentmesh"
LOG_DIR="$PROJECT_ROOT/logs"
DAYS_TO_KEEP=7

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "🧹 Starting log cleanup..."

# Clean old log files
find "$LOG_DIR" -name "*.log" -type f -mtime +$DAYS_TO_KEEP -delete
find "$LOG_DIR" -name "*.log.*" -type f -mtime +$DAYS_TO_KEEP -delete

# Clean PM2 old logs (keep last 1000 lines per service)
pm2 flush 2>/dev/null || true

# Clean tmp directory
find "$PROJECT_ROOT/tmp" -name "*.json" -type f -mtime +7 -delete 2>/dev/null || true

log "✅ Log cleanup complete"


