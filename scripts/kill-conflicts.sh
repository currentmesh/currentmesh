#!/bin/bash
# Kill processes using CurrentMesh ports
# Use with caution - only kills processes on our designated ports

set -e

PORTS=(3000 3001 5000 5001 5002)
PORT_NAMES=("Backend API" "Marketing Site" "Main App" "Client Portal" "Admin Dashboard")

echo "🔍 Finding processes using CurrentMesh ports..."
echo ""

for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    NAME=${PORT_NAMES[$i]}
    
    PIDS=$(ss -tlnp 2>/dev/null | grep ":${PORT} " | awk '{print $6}' | cut -d, -f2 | cut -d= -f2 | sort -u)
    
    if [ -n "$PIDS" ]; then
        for PID in $PIDS; do
            if [ -n "$PID" ] && [ "$PID" != "PID" ]; then
                PROCESS_NAME=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
                echo "⚠️  Port ${PORT} (${NAME}) is used by PID ${PID} (${PROCESS_NAME})"
                
                # Check if it's a PM2 process
                if pm2 list | grep -q "$PID"; then
                    echo "   → This is a PM2 process. Use 'pm2 stop <name>' instead."
                else
                    read -p "   Kill PID ${PID}? (y/N): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        kill $PID 2>/dev/null && echo "   ✅ Killed PID ${PID}" || echo "   ❌ Failed to kill PID ${PID}"
                    fi
                fi
            fi
        done
    fi
done

echo ""
echo "✅ Port conflict check complete"


