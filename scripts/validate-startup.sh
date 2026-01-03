#!/bin/bash
# Startup Validation Script
# Validates environment and configuration before starting services

set -e

PROJECT_ROOT="/var/www/currentmesh"
ERRORS=0

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_file() {
    if [ ! -f "$1" ]; then
        log "❌ Missing file: $1"
        ERRORS=$((ERRORS + 1))
    else
        log "✅ Found: $1"
    fi
}

check_env_var() {
    local VAR=$1
    local FILE=$2
    
    if grep -q "^${VAR}=" "$FILE" 2>/dev/null; then
        if grep "^${VAR}=" "$FILE" | grep -qv "^\s*#"; then
            VALUE=$(grep "^${VAR}=" "$FILE" | cut -d= -f2- | head -1)
            if [ -n "$VALUE" ] && [ "$VALUE" != "" ]; then
                log "✅ $VAR is set in $FILE"
                return 0
            fi
        fi
    fi
    log "❌ $VAR is missing or empty in $FILE"
    ERRORS=$((ERRORS + 1))
    return 1
}

log "🔍 Validating CurrentMesh startup configuration..."
echo ""

# Check critical files
log "Checking critical files..."
check_file "$PROJECT_ROOT/ecosystem.config.js"
check_file "$PROJECT_ROOT/server/.env.local"
check_file "$PROJECT_ROOT/server/src/index.ts"
check_file "$PROJECT_ROOT/server/package.json"
echo ""

# Check environment variables
log "Checking environment variables..."
check_env_var "DATABASE_URL" "$PROJECT_ROOT/server/.env.local"
check_env_var "JWT_SECRET" "$PROJECT_ROOT/server/.env.local"
check_env_var "JWT_REFRESH_SECRET" "$PROJECT_ROOT/server/.env.local"
check_env_var "PORT" "$PROJECT_ROOT/server/.env.local"
echo ""

# Check ports
log "Checking for port conflicts..."
if "$PROJECT_ROOT/scripts/check-ports.sh" > /dev/null 2>&1; then
    log "✅ All ports are available"
else
    log "⚠️  Port conflicts detected (will be resolved on startup)"
fi
echo ""

# Check PM2
if command -v pm2 &> /dev/null; then
    log "✅ PM2 is installed"
else
    log "❌ PM2 is not installed"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log "✅ Node.js is installed: $NODE_VERSION"
else
    log "❌ Node.js is not installed"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Summary
if [ $ERRORS -eq 0 ]; then
    log "✅ All startup validations passed!"
    exit 0
else
    log "❌ Found $ERRORS validation error(s)"
    log "Please fix the errors before starting services"
    exit 1
fi


