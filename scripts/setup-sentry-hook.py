#!/usr/bin/env python3
"""
Setup Sentry Event Hook via API
"""
import os
import json
import urllib.request
import urllib.error
import sys

def get_env_var(key, default=None):
    """Get environment variable from .env-config/.env"""
    env_path = '.env-config/.env'
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    if k == key:
                        return v
    return default or os.getenv(key)

def main():
    auth_token = get_env_var('SENTRY_AUTH_TOKEN', '')
    org_slug = get_env_var('SENTRY_ORG', '')
    webhook_url = "https://api.currentmesh.com/api/sentry/webhook"
    
    if not auth_token:
        print("❌ Error: SENTRY_AUTH_TOKEN not found")
        sys.exit(1)
    
    # Get organization if not set
    if not org_slug:
        print("🔍 Getting organization from API...")
        try:
            req = urllib.request.Request('https://sentry.io/api/0/organizations/')
            req.add_header('Authorization', f'Bearer {auth_token}')
            
            with urllib.request.urlopen(req) as response:
                orgs = json.loads(response.read().decode())
                if orgs:
                    org_slug = orgs[0]['slug']
                    print(f"✅ Found organization: {org_slug}")
                else:
                    print("❌ No organizations found")
                    sys.exit(1)
        except Exception as e:
            print(f"❌ Error getting organization: {e}")
            sys.exit(1)
    
    print(f"\n📋 Setting up Event Hook...")
    print(f"   Organization: {org_slug}")
    print(f"   Webhook URL: {webhook_url}")
    
    # Try different API endpoints
    endpoints = [
        f'https://sentry.io/api/0/organizations/{org_slug}/hooks/',
        f'https://sentry.io/api/0/organizations/{org_slug}/webhooks/',
        f'https://sentry.io/api/0/organizations/{org_slug}/integrations/',
    ]
    
    data = {
        "url": webhook_url,
        "events": ["event.created", "event.updated", "issue.created", "issue.updated", "issue.resolved"]
    }
    
    for endpoint in endpoints:
        try:
            print(f"\n🔗 Trying: {endpoint}")
            req = urllib.request.Request(endpoint)
            req.add_header('Authorization', f'Bearer {auth_token}')
            req.add_header('Content-Type', 'application/json')
            req.data = json.dumps(data).encode()
            req.method = 'POST'
            
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                print(f"✅ Event Hook created successfully!")
                print(f"   Hook ID: {result.get('id', 'N/A')}")
                print(f"   Webhook URL: {webhook_url}")
                return
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            if e.code == 404:
                print(f"   ❌ 404 - Endpoint not found")
                continue
            elif e.code == 400:
                print(f"   ❌ 400 - Bad request: {error_body}")
                # Maybe this endpoint exists but needs different data
                continue
            else:
                print(f"   ❌ {e.code} - {error_body}")
                continue
        except Exception as e:
            print(f"   ❌ Error: {e}")
            continue
    
    print("\n❌ Could not create event hook via API")
    print("\n💡 Alternative: Set up manually in Sentry Dashboard")
    print("   1. Go to Settings → Integrations → Event Hooks")
    print(f"   2. Add webhook URL: {webhook_url}")
    print("   3. Select events: issue.created, issue.updated, issue.resolved")

if __name__ == '__main__':
    main()

