#!/bin/bash
# Health Check Script for All CurrentMesh Services
# Validates that all services are running and responding

set -e

SERVICES=(
  "currentmesh-server:3000:/health"
  "currentmesh-marketing:3001:/"
  "currentmesh-app:5000:/"
  "currentmesh-client:5001:/"
  "currentmesh-admin:5002:/"
)

FAILED=0
PASSED=0

echo "🏥 CurrentMesh Health Check"
echo "=========================="
echo ""

# Check PM2 status
echo "📊 PM2 Service Status:"
pm2 list | grep -E "name|currentmesh" || echo "No PM2 services found"
echo ""

# Check each service
for SERVICE_CONFIG in "${SERVICES[@]}"; do
  IFS=':' read -r NAME PORT PATH <<< "$SERVICE_CONFIG"
  
  echo -n "Checking ${NAME} (port ${PORT})... "
  
  # Check if process is running
  PM2_STATUS=$(pm2 list 2>/dev/null | grep "$NAME" 2>/dev/null || echo "")
  if echo "$PM2_STATUS" | grep -q "online" 2>/dev/null; then
    # Check if port is listening
    if ss -tlnp | grep -q ":${PORT} "; then
      # Try to connect (with timeout)
      if timeout 2 curl -s -f "http://localhost:${PORT}${PATH}" > /dev/null 2>&1; then
        echo "✅ OK"
        PASSED=$((PASSED + 1))
      else
        echo "⚠️  Port open but not responding"
        FAILED=$((FAILED + 1))
      fi
    else
      echo "❌ Port not listening"
      FAILED=$((FAILED + 1))
    fi
  else
    echo "❌ Not running in PM2"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "=========================="
echo "✅ Passed: ${PASSED}"
echo "❌ Failed: ${FAILED}"

if [ $FAILED -gt 0 ]; then
  echo ""
  echo "⚠️  Some services are not healthy"
  echo "Check logs with: pm2 logs"
  exit 1
else
  echo ""
  echo "✅ All services are healthy!"
  exit 0
fi

