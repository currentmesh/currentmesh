#!/bin/bash
# Sentry Release Tracking Script
# Creates a release in Sentry for tracking deployments

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment
if [ -f .env-config/.env ]; then
    source .env-config/.env
else
    echo -e "${YELLOW}Warning: .env-config/.env not found${NC}"
fi

# Get version from package.json or use git commit
VERSION=${1:-$(git rev-parse --short HEAD 2>/dev/null || echo "dev")}
ORG_SLUG=${SENTRY_ORG:-"4510628533370880"}
AUTH_TOKEN=${SENTRY_AUTH_TOKEN:-""}

if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}Warning: SENTRY_AUTH_TOKEN not set. Skipping release creation.${NC}"
    exit 0
fi

echo -e "${BLUE}Creating Sentry release: ${VERSION}${NC}"

# Create release for frontend project
FRONTEND_PROJECT="4510628587634688"
curl -s -X POST "https://sentry.io/api/0/organizations/${ORG_SLUG}/releases/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{\"version\":\"${VERSION}\",\"projects\":[\"${FRONTEND_PROJECT}\"]}" \
  > /dev/null

# Create release for backend project
BACKEND_PROJECT="4510628617191424"
curl -s -X POST "https://sentry.io/api/0/organizations/${ORG_SLUG}/releases/" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{\"version\":\"${VERSION}\",\"projects\":[\"${BACKEND_PROJECT}\"]}" \
  > /dev/null

echo -e "${GREEN}✅ Sentry release created: ${VERSION}${NC}"

