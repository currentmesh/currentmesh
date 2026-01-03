#!/bin/bash
# Port Conflict Detection Script
# Checks for port conflicts before starting services

set -e

PORTS=(3000 3001 5000 5001 5002)
PORT_NAMES=("Backend API" "Marketing Site" "Main App" "Client Portal" "Admin Dashboard")
CONFLICTS=0

echo "🔍 Checking for port conflicts..."
echo ""

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}
    
    if ss -tlnp | grep -q ":${PORT} "; then
        PROCESS=$(ss -tlnp | grep ":${PORT} " | awk '{print $6}' | cut -d, -f2 | cut -d= -f2)
        echo "❌ Port ${PORT} (${NAME}) is in use by PID: ${PROCESS}"
        CONFLICTS=$((CONFLICTS + 1))
    else
        echo "✅ Port ${PORT} (${NAME}) is available"
    fi
done

echo ""
if [ $CONFLICTS -gt 0 ]; then
    echo "⚠️  Found ${CONFLICTS} port conflict(s)"
    echo "Run: ./scripts/kill-conflicts.sh to free ports"
    exit 1
else
    echo "✅ All ports are available"
    exit 0
fi


