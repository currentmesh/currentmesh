#!/usr/bin/env python3
"""
Cloudflare SSL Configuration
Sets SSL mode to "Full" for all CurrentMesh domains
"""

import os
import sys
import json
import requests
from pathlib import Path

# Colors
class Colors:
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'

def load_env():
    """Load environment variables"""
    env_path = Path(__file__).parent.parent / '.cloudflare' / '.env'
    
    if not env_path.exists():
        print(f"{Colors.RED}Error: .cloudflare/.env file not found!{Colors.NC}")
        sys.exit(1)
    
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    return env_vars

def set_ssl_mode(api_token, zone_id, ssl_mode='full'):
    """
    Set SSL mode for the zone
    ssl_mode options: 'off', 'flexible', 'full', 'strict'
    """
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl'
    
    data = {'value': ssl_mode}
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            print(f"{Colors.GREEN}✅ SSL mode set to '{ssl_mode}'{Colors.NC}")
            return True
        else:
            errors = result.get('errors', [])
            print(f"{Colors.RED}❌ Error: {errors}{Colors.NC}")
            return False
    else:
        print(f"{Colors.RED}❌ Error: {response.status_code} - {response.text}{Colors.NC}")
        return False

def get_ssl_mode(api_token, zone_id):
    """Get current SSL mode"""
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            return result['result']['value']
    return None

def main():
    print(f"{Colors.BLUE}=== Cloudflare SSL Configuration ==={Colors.NC}\n")
    
    # Load environment
    env = load_env()
    api_token = env.get('CLOUDFLARE_API_TOKEN')
    zone_id = env.get('CLOUDFLARE_ZONE_ID')
    
    if not api_token or not zone_id:
        print(f"{Colors.RED}Error: Missing API token or Zone ID{Colors.NC}")
        sys.exit(1)
    
    # Get current SSL mode
    current_mode = get_ssl_mode(api_token, zone_id)
    if current_mode:
        print(f"{Colors.YELLOW}Current SSL mode: {current_mode}{Colors.NC}\n")
    
    # Set SSL mode to "full"
    # Options: 'off', 'flexible', 'full', 'strict'
    # 'full' = Cloudflare handles SSL, origin can use HTTP or HTTPS (any cert)
    # 'strict' = Cloudflare handles SSL, origin must use HTTPS with valid cert
    print(f"{Colors.BLUE}Setting SSL mode to 'full'...{Colors.NC}")
    print(f"{Colors.YELLOW}Note: 'full' mode allows HTTP on origin (Cloudflare handles SSL){Colors.NC}\n")
    
    if set_ssl_mode(api_token, zone_id, 'full'):
        print(f"\n{Colors.GREEN}=== SSL Configuration Complete! ==={Colors.NC}\n")
        print(f"{Colors.BLUE}SSL Mode: Full{Colors.NC}")
        print(f"{Colors.GREEN}✅ Cloudflare terminates SSL (visitor → Cloudflare is HTTPS){Colors.NC}")
        print(f"{Colors.GREEN}✅ Origin can use HTTP (Cloudflare → Origin){Colors.NC}")
        print(f"\n{Colors.YELLOW}Your sites are now accessible via HTTPS!{Colors.NC}")
        print(f"  - https://currentmesh.com")
        print(f"  - https://app.currentmesh.com")
        print(f"  - https://api.currentmesh.com")
        print(f"\n{Colors.YELLOW}Note: Nginx can continue using HTTP (port 80){Colors.NC}")
        print(f"{Colors.YELLOW}Cloudflare automatically handles SSL termination.{Colors.NC}")
    else:
        print(f"\n{Colors.RED}Failed to set SSL mode{Colors.NC}")
        sys.exit(1)

if __name__ == '__main__':
    main()

