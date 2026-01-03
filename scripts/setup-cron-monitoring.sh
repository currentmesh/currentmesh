#!/bin/bash
# Setup cron jobs for automated monitoring and recovery

set -e

PROJECT_ROOT="/var/www/currentmesh"
SCRIPT_DIR="$PROJECT_ROOT/scripts"

# Create cron jobs
(crontab -l 2>/dev/null | grep -v "currentmesh" || true; cat << EOF
# CurrentMesh Automated Monitoring
# Health check every 5 minutes
*/5 * * * * $SCRIPT_DIR/monitor-services.sh >> $PROJECT_ROOT/logs/monitor-cron.log 2>&1

# Full recovery check every 15 minutes
*/15 * * * * $SCRIPT_DIR/auto-recovery.sh >> $PROJECT_ROOT/logs/recovery-cron.log 2>&1
EOF
) | crontab -

echo "✅ Cron jobs configured for automated monitoring"
echo ""
echo "Monitoring schedule:"
echo "  - Health check: Every 5 minutes"
echo "  - Recovery check: Every 15 minutes"
echo ""
echo "Logs:"
echo "  - Monitor: $PROJECT_ROOT/logs/monitor-cron.log"
echo "  - Recovery: $PROJECT_ROOT/logs/recovery-cron.log"


