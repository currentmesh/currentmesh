#!/bin/bash
# Setup Sentry Event Hook via API

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment
if [ -f .env-config/.env ]; then
    source .env-config/.env
else
    echo -e "${RED}Error: .env-config/.env not found${NC}"
    exit 1
fi

AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-""}
ORG_SLUG=${SENTRY_ORG:-""}

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${RED}Error: SENTRY_AUTH_TOKEN not set in .env-config/.env${NC}"
    exit 1
fi

if [ -z "$ORG_SLUG" ]; then
    echo -e "${YELLOW}Warning: SENTRY_ORG not set. Attempting to get from API...${NC}"
    # Try to get org from API
    ORG_RESPONSE=$(curl -s -X GET "https://sentry.io/api/0/organizations/" \
      -H "Authorization: Bearer ${AUTH_TOKEN}")
    
    ORG_SLUG=$(echo "$ORG_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['slug'] if data else '')" 2>/dev/null || echo "")
    
    if [ -z "$ORG_SLUG" ]; then
        echo -e "${RED}Error: Could not determine organization slug. Please set SENTRY_ORG in .env-config/.env${NC}"
        exit 1
    fi
    echo -e "${GREEN}Found organization: ${ORG_SLUG}${NC}"
fi

# Webhook URL (update this to your production URL)
WEBHOOK_URL="https://api.currentmesh.com/api/sentry/webhook"

# For local testing, you might want to use ngrok or similar
# WEBHOOK_URL="https://your-ngrok-url.ngrok.io/api/sentry/webhook"

echo -e "${BLUE}Setting up Sentry Event Hook...${NC}"
echo -e "Organization: ${ORG_SLUG}"
echo -e "Webhook URL: ${WEBHOOK_URL}"

# Create event hook
RESPONSE=$(curl -s -X POST "https://sentry.io/api/0/organizations/${ORG_SLUG}/hooks/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{
    \"url\": \"${WEBHOOK_URL}\",
    \"events\": [\"event.created\", \"event.updated\", \"issue.created\", \"issue.updated\", \"issue.resolved\"]
  }")

# Check if successful
if echo "$RESPONSE" | grep -q '"id"'; then
    HOOK_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null || echo "")
    echo -e "${GREEN}✅ Event Hook created successfully!${NC}"
    echo -e "Hook ID: ${HOOK_ID}"
    echo -e "${BLUE}Webhook URL: ${WEBHOOK_URL}${NC}"
else
    echo -e "${RED}❌ Failed to create event hook${NC}"
    echo "Response: $RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
