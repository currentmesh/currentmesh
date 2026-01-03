#!/bin/bash
# Nginx Configuration Setup for CurrentMesh
# Sets up Nginx for marketing site, admin dashboard, and API

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== CurrentMesh Nginx Setup ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx not found. Installing...${NC}"
    apt-get update
    apt-get install -y nginx
fi

NGINX_DIR="/etc/nginx"
SITES_AVAILABLE="$NGINX_DIR/sites-available"
SITES_ENABLED="$NGINX_DIR/sites-enabled"
PROJECT_DIR="/var/www/currentmesh"

echo -e "${BLUE}Creating Nginx configuration files...${NC}\n"

# Marketing Site Configuration (currentmesh.com)
cat > "$SITES_AVAILABLE/currentmesh.com" << 'EOF'
# Marketing Site - currentmesh.com
server {
    listen 80;
    listen [::]:80;
    server_name currentmesh.com www.currentmesh.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name currentmesh.com www.currentmesh.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/currentmesh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/currentmesh.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Root directory
    root /var/www/currentmesh/marketing/.next;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Next.js static files
    location /_next/static {
        alias /var/www/currentmesh/marketing/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js server
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

# Admin Dashboard Configuration (app.currentmesh.com)
cat > "$SITES_AVAILABLE/app.currentmesh.com" << 'EOF'
# Admin Dashboard - app.currentmesh.com
server {
    listen 80;
    listen [::]:80;
    server_name app.currentmesh.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.currentmesh.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/app.currentmesh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.currentmesh.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Root directory (Vite build output)
    root /var/www/currentmesh/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static assets caching
    location /assets {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

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

# API Configuration (api.currentmesh.com)
cat > "$SITES_AVAILABLE/api.currentmesh.com" << 'EOF'
# Backend API - api.currentmesh.com
server {
    listen 80;
    listen [::]:80;
    server_name api.currentmesh.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.currentmesh.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.currentmesh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.currentmesh.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS headers (adjust as needed)
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

echo -e "${GREEN}✅ Nginx configuration files created${NC}\n"

# Enable sites
echo -e "${BLUE}Enabling sites...${NC}"
ln -sf "$SITES_AVAILABLE/currentmesh.com" "$SITES_ENABLED/currentmesh.com"
ln -sf "$SITES_AVAILABLE/app.currentmesh.com" "$SITES_ENABLED/app.currentmesh.com"
ln -sf "$SITES_AVAILABLE/api.currentmesh.com" "$SITES_ENABLED/api.currentmesh.com"

echo -e "${GREEN}✅ Sites enabled${NC}\n"

# Test Nginx configuration
echo -e "${BLUE}Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}\n"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

echo -e "${YELLOW}Note:${NC} SSL certificates need to be obtained with Certbot before enabling HTTPS"
echo -e "${YELLOW}Note:${NC} Run certbot to get SSL certificates for all domains"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Run: certbot --nginx -d currentmesh.com -d www.currentmesh.com"
echo "2. Run: certbot --nginx -d app.currentmesh.com"
echo "3. Run: certbot --nginx -d api.currentmesh.com"
echo "4. Reload Nginx: systemctl reload nginx"

