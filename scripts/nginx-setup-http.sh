#!/bin/bash
# Nginx HTTP Configuration Setup (before SSL)
# Sets up Nginx for marketing site, admin dashboard, and API (HTTP only)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== CurrentMesh Nginx HTTP Setup ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

NGINX_DIR="/etc/nginx"
SITES_AVAILABLE="$NGINX_DIR/sites-available"
SITES_ENABLED="$NGINX_DIR/sites-enabled"

# Marketing Site Configuration (HTTP only - for Certbot)
cat > "$SITES_AVAILABLE/currentmesh.com" << 'EOF'
# Marketing Site - currentmesh.com (HTTP - will be upgraded to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name currentmesh.com www.currentmesh.com;

    # For Certbot verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Next.js server (development mode)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Admin Dashboard Configuration (HTTP only - for Certbot)
cat > "$SITES_AVAILABLE/app.currentmesh.com" << 'EOF'
# Admin Dashboard - app.currentmesh.com (HTTP - will be upgraded to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name app.currentmesh.com;

    # For Certbot verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Root directory (Vite build output)
    root /var/www/currentmesh/client/dist;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA routing - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# API Configuration (HTTP only - for Certbot)
cat > "$SITES_AVAILABLE/api.currentmesh.com" << 'EOF'
# Backend API - api.currentmesh.com (HTTP - will be upgraded to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name api.currentmesh.com;

    # For Certbot verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # API proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo -e "${GREEN}✅ Nginx HTTP configuration files created${NC}\n"

# Enable sites
echo -e "${BLUE}Enabling sites...${NC}"
ln -sf "$SITES_AVAILABLE/currentmesh.com" "$SITES_ENABLED/currentmesh.com"
ln -sf "$SITES_AVAILABLE/app.currentmesh.com" "$SITES_ENABLED/app.currentmesh.com"
ln -sf "$SITES_AVAILABLE/api.currentmesh.com" "$SITES_ENABLED/api.currentmesh.com"

# Remove default site
rm -f "$SITES_ENABLED/default"

echo -e "${GREEN}✅ Sites enabled${NC}\n"

# Test Nginx configuration
echo -e "${BLUE}Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}\n"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}\n"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

echo -e "${YELLOW}Next: Install Certbot and get SSL certificates${NC}"
echo "Run: /var/www/currentmesh/scripts/ssl-setup.sh"

