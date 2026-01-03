#!/bin/bash
# SSL Certificate Setup with Certbot
# Gets SSL certificates for all CurrentMesh domains

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== CurrentMesh SSL Certificate Setup ===${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

echo -e "${BLUE}Getting SSL certificates...${NC}\n"

# Get certificate for main domain
echo -e "${YELLOW}Getting certificate for currentmesh.com and www.currentmesh.com...${NC}"
certbot --nginx -d currentmesh.com -d www.currentmesh.com --non-interactive --agree-tos --email admin@currentmesh.com --redirect

# Get certificate for app subdomain
echo -e "${YELLOW}Getting certificate for app.currentmesh.com...${NC}"
certbot --nginx -d app.currentmesh.com --non-interactive --agree-tos --email admin@currentmesh.com --redirect

# Get certificate for API subdomain
echo -e "${YELLOW}Getting certificate for api.currentmesh.com...${NC}"
certbot --nginx -d api.currentmesh.com --non-interactive --agree-tos --email admin@currentmesh.com --redirect

echo -e "${GREEN}✅ SSL certificates obtained${NC}\n"

# Test Nginx configuration
echo -e "${BLUE}Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}\n"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded with SSL${NC}\n"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

# Set up auto-renewal
echo -e "${BLUE}Setting up certificate auto-renewal...${NC}"
systemctl enable certbot.timer
systemctl start certbot.timer

echo -e "${GREEN}✅ SSL setup complete!${NC}\n"
echo -e "${GREEN}Certificates will auto-renew via certbot.timer${NC}\n"

