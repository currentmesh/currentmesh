#!/bin/bash
# Setup log rotation for PM2 and application logs

set -e

PROJECT_ROOT="/var/www/currentmesh"
LOG_DIR="$PROJECT_ROOT/logs"

# Create logrotate configuration
cat > /etc/logrotate.d/currentmesh << EOF
$LOG_DIR/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}

/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}
EOF

echo "✅ Log rotation configured"
echo "Logs will be rotated daily, kept for 14 days, and compressed"


