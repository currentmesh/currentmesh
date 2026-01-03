#!/bin/bash
# Development Stability Check
# Comprehensive check before starting development work

set -e

PROJECT_ROOT="/var/www/currentmesh"
SCRIPT_DIR="$PROJECT_ROOT/scripts"

echo "🔍 CurrentMesh Development Stability Check"
echo "=========================================="
echo ""

# Check 1: Services Status
echo "1️⃣  Checking PM2 Services..."
pm2 status
echo ""

# Check 2: Port Conflicts
echo "2️⃣  Checking for Port Conflicts..."
if [ -f "$SCRIPT_DIR/check-ports.sh" ]; then
    "$SCRIPT_DIR/check-ports.sh"
else
    echo "   ⚠️  Port check script not found"
fi
echo ""

# Check 3: Disk Space
echo "3️⃣  Checking Disk Space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}')
echo "   Disk Usage: $DISK_USAGE"
if [ "$(df / | awk 'NR==2 {print $5}' | sed 's/%//')" -gt 80 ]; then
    echo "   ⚠️  WARNING: Disk usage above 80%"
else
    echo "   ✅ Disk space OK"
fi
echo ""

# Check 4: Memory
echo "4️⃣  Checking Memory..."
MEM_INFO=$(free -h | awk 'NR==2')
echo "   $MEM_INFO"
MEM_PERCENT=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ "$MEM_PERCENT" -gt 85 ]; then
    echo "   ⚠️  WARNING: Memory usage above 85%"
else
    echo "   ✅ Memory OK"
fi
echo ""

# Check 5: Service Health
echo "5️⃣  Checking Service Health..."
if [ -f "$SCRIPT_DIR/monitor-services.sh" ]; then
    "$SCRIPT_DIR/monitor-services.sh" || echo "   ⚠️  Some services may need attention"
else
    echo "   ⚠️  Health check script not found"
fi
echo ""

# Check 6: Database Connection
echo "6️⃣  Checking Database Connection..."
if curl -s -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "   ✅ API server responding"
    DB_STATUS=$(curl -s http://localhost:3000/health | jq -r '.database.connected // "unknown"' 2>/dev/null || echo "unknown")
    if [ "$DB_STATUS" = "true" ]; then
        echo "   ✅ Database connected"
    else
        echo "   ⚠️  Database connection status: $DB_STATUS"
    fi
else
    echo "   ⚠️  API server not responding"
fi
echo ""

# Check 7: Nginx Status
echo "7️⃣  Checking Nginx..."
if systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx is running"
else
    echo "   ⚠️  Nginx is not running"
fi
echo ""

# Check 8: Recent Errors
echo "8️⃣  Checking Recent Errors..."
ERROR_COUNT=$(pm2 logs --lines 50 --nostream 2>&1 | grep -i "error\|fatal\|crash" | wc -l)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "   ⚠️  Found $ERROR_COUNT recent errors in logs"
    echo "   Run 'pm2 logs' to review"
else
    echo "   ✅ No recent errors detected"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Stability check complete!"
echo ""
echo "💡 Tips for stable development:"
echo "   - Monitor logs: pm2 logs"
echo "   - Check status: pm2 status"
echo "   - View resources: pm2 monit"
echo "   - Run health check: $SCRIPT_DIR/monitor-services.sh"
echo ""


