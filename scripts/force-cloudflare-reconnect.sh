#!/bin/bash
# Force Cloudflare to reconnect by toggling proxy status

set -e

PROJECT_ROOT="/var/www/currentmesh"
ENV_FILE="$PROJECT_ROOT/.cloudflare/.env"

# Load environment
source <(grep -v '^#' "$ENV_FILE" | grep -v '^$' | sed 's/^/export /')

if [ -z "$CLOUDFLARE_ZONE_ID" ] || [ -z "$CLOUDFLARE_GLOBAL_API_KEY" ] || [ -z "$SERVER_IP" ]; then
    echo "❌ Missing required environment variables"
    exit 1
fi

echo "🔄 Forcing Cloudflare to reconnect..."
echo ""

# Get Cloudflare email
if [ -z "$CLOUDFLARE_EMAIL" ]; then
    echo "Please provide your Cloudflare account email:"
    read -r CLOUDFLARE_EMAIL
    echo "CLOUDFLARE_EMAIL=$CLOUDFLARE_EMAIL" >> "$ENV_FILE"
fi

# Get DNS record ID
echo "📋 Getting DNS record..."
RECORD_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records?name=api.currentmesh.com" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_GLOBAL_API_KEY" \
    -H "Content-Type: application/json")

RECORD_ID=$(echo "$RECORD_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d['result'][0]['id']) if d.get('success') and d.get('result') else exit(1)" 2>/dev/null)

if [ -z "$RECORD_ID" ]; then
    echo "❌ Failed to get DNS record"
    exit 1
fi

echo "✅ Found DNS record: $RECORD_ID"
echo ""

# Step 1: Disable proxy
echo "1️⃣  Disabling Cloudflare proxy (DNS-only mode)..."
DISABLE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_GLOBAL_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"api.currentmesh.com\",\"content\":\"$SERVER_IP\",\"proxied\":false}")

if echo "$DISABLE_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; then
    echo "✅ Proxy disabled"
else
    echo "❌ Failed to disable proxy"
    echo "$DISABLE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DISABLE_RESPONSE"
    exit 1
fi

echo ""
echo "⏳ Waiting 30 seconds for DNS propagation..."
sleep 30

# Step 2: Test direct connection
echo ""
echo "2️⃣  Testing direct connection..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/health" -H "Host: api.currentmesh.com" --max-time 10)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Direct connection works (HTTP $HTTP_CODE)"
else
    echo "⚠️  Direct connection returned HTTP $HTTP_CODE"
fi

# Step 3: Re-enable proxy
echo ""
echo "3️⃣  Re-enabling Cloudflare proxy..."
ENABLE_RESPONSE=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/dns_records/$RECORD_ID" \
    -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
    -H "X-Auth-Key: $CLOUDFLARE_GLOBAL_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"A\",\"name\":\"api.currentmesh.com\",\"content\":\"$SERVER_IP\",\"proxied\":true}")

if echo "$ENABLE_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); exit(0 if d.get('success') else 1)" 2>/dev/null; then
    echo "✅ Proxy re-enabled"
else
    echo "❌ Failed to re-enable proxy"
    echo "$ENABLE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ENABLE_RESPONSE"
    exit 1
fi

echo ""
echo "⏳ Waiting 30 seconds for DNS propagation..."
sleep 30

echo ""
echo "✅ Cloudflare reconnection forced!"
echo "🌐 Test: curl https://api.currentmesh.com/health"
echo "⏱️  May take 5-10 minutes for full propagation"


