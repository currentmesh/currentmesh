#!/bin/bash
# Cloudflare DNS Configuration Script for CurrentMesh
# This script sets up DNS records for all CurrentMesh subdomains

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .cloudflare/.env ]; then
    source .cloudflare/.env
else
    echo -e "${RED}Error: .cloudflare/.env file not found!${NC}"
    echo "Please create .cloudflare/.env with your Cloudflare credentials"
    echo "See .cloudflare/README.md for instructions"
    exit 1
fi

# Check required variables
if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ] || [ -z "$SERVER_IP" ]; then
    echo -e "${RED}Error: Missing required environment variables!${NC}"
    echo "Required: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, SERVER_IP"
    exit 1
fi

echo -e "${BLUE}=== CurrentMesh Cloudflare DNS Setup ===${NC}\n"

# Function to create or update DNS record
create_dns_record() {
    local name=$1
    local type=$2
    local content=$3
    local proxied=${4:-true}  # Default to proxied (Cloudflare proxy)
    
    echo -e "${YELLOW}Setting up DNS record: ${name}${NC}"
    
    # Check if record exists
    existing_record=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${name}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" | jq -r '.result[0].id // empty')
    
    if [ -n "$existing_record" ]; then
        echo -e "  ${YELLOW}Record exists, updating...${NC}"
        response=$(curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${existing_record}" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"${type}\",\"name\":\"${name}\",\"content\":\"${content}\",\"ttl\":1,\"proxied\":${proxied}}")
    else
        echo -e "  ${GREEN}Creating new record...${NC}"
        response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
            -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
            -H "Content-Type: application/json" \
            --data "{\"type\":\"${type}\",\"name\":\"${name}\",\"content\":\"${content}\",\"ttl\":1,\"proxied\":${proxied}}")
    fi
    
    success=$(echo "$response" | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo -e "  ${GREEN}✅ Success!${NC}\n"
    else
        echo -e "  ${RED}❌ Error:${NC}"
        echo "$response" | jq -r '.errors[0].message // .errors'
        echo ""
    fi
}

# Create DNS records
echo -e "${BLUE}Creating DNS records...${NC}\n"

# Main domain (marketing site)
create_dns_record "currentmesh.com" "A" "$SERVER_IP" true
create_dns_record "www.currentmesh.com" "A" "$SERVER_IP" true

# Admin dashboard subdomain
create_dns_record "app.currentmesh.com" "A" "$SERVER_IP" true

# API subdomain (optional - can use /api path instead)
create_dns_record "api.currentmesh.com" "A" "$SERVER_IP" false

echo -e "${GREEN}=== DNS Setup Complete! ===${NC}\n"
echo -e "DNS records created:"
echo -e "  ${GREEN}✓${NC} currentmesh.com → ${SERVER_IP}"
echo -e "  ${GREEN}✓${NC} www.currentmesh.com → ${SERVER_IP}"
echo -e "  ${GREEN}✓${NC} app.currentmesh.com → ${SERVER_IP}"
echo -e "  ${GREEN}✓${NC} api.currentmesh.com → ${SERVER_IP}"
echo ""
echo -e "${YELLOW}Note:${NC} DNS propagation may take a few minutes."
echo -e "${YELLOW}Note:${NC} SSL/TLS certificates will be automatically provisioned by Cloudflare."

