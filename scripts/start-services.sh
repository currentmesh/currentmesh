#!/bin/bash
# Start all CurrentMesh services with port validation
# Ensures no port conflicts before starting

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "🚀 Starting CurrentMesh Services"
echo "================================"
echo ""

# Check for port conflicts
if ! "$SCRIPT_DIR/check-ports.sh"; then
    echo ""
    echo "❌ Port conflicts detected. Please resolve before starting services."
    echo "   Run: ./scripts/kill-conflicts.sh"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Install with: npm install -g pm2"
    exit 1
fi

# Validate startup configuration
if ! "$SCRIPT_DIR/validate-startup.sh"; then
    echo ""
    echo "❌ Startup validation failed. Please fix the errors above."
    exit 1
fi

# Check if ecosystem config exists
if [ ! -f "$PROJECT_ROOT/ecosystem.config.js" ]; then
    echo "❌ ecosystem.config.js not found"
    exit 1
fi

echo ""
echo "📋 Starting services with PM2..."
echo ""

# Stop all services first (if running)
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start all services from ecosystem config
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "📊 Service Status:"
pm2 list

echo ""
echo "✅ Services started!"
echo ""
echo "Useful commands:"
echo "  pm2 logs              - View all logs"
echo "  pm2 logs <name>       - View specific service logs"
echo "  pm2 monit             - Monitor services"
echo "  pm2 stop all          - Stop all services"
echo "  pm2 restart all       - Restart all services"

