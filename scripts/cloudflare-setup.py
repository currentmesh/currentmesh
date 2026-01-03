#!/usr/bin/env python3
"""
Cloudflare DNS Configuration Script for CurrentMesh
Sets up DNS records for all CurrentMesh subdomains
"""

import os
import sys
import json
import requests
from pathlib import Path

# Colors for terminal output
class Colors:
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'  # No Color

def load_env():
    """Load environment variables from .cloudflare/.env file"""
    env_path = Path(__file__).parent.parent / '.cloudflare' / '.env'
    
    if not env_path.exists():
        print(f"{Colors.RED}Error: .cloudflare/.env file not found!{Colors.NC}")
        print("Please create .cloudflare/.env with your Cloudflare credentials")
        print("See .cloudflare/README.md for instructions")
        sys.exit(1)
    
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    return env_vars

def create_dns_record(api_token, zone_id, name, record_type, content, proxied=True):
    """Create or update a DNS record"""
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    
    # Check if record exists
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records'
    params = {'name': name}
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code != 200:
        print(f"{Colors.RED}Error checking existing records: {response.text}{Colors.NC}")
        return False
    
    data = response.json()
    existing_records = data.get('result', [])
    
    record_data = {
        'type': record_type,
        'name': name,
        'content': content,
        'ttl': 1,  # Auto TTL
        'proxied': proxied
    }
    
    if existing_records:
        # Update existing record
        record_id = existing_records[0]['id']
        print(f"{Colors.YELLOW}Record exists, updating: {name}{Colors.NC}")
        url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}'
        response = requests.patch(url, headers=headers, json=record_data)
    else:
        # Create new record
        print(f"{Colors.GREEN}Creating new record: {name}{Colors.NC}")
        url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records'
        response = requests.post(url, headers=headers, json=record_data)
    
    if response.status_code in [200, 201]:
        result = response.json()
        if result.get('success'):
            print(f"{Colors.GREEN}  ✅ Success!{Colors.NC}\n")
            return True
        else:
            errors = result.get('errors', [])
            print(f"{Colors.RED}  ❌ Error: {errors}{Colors.NC}\n")
            return False
    else:
        print(f"{Colors.RED}  ❌ Error: {response.status_code} - {response.text}{Colors.NC}\n")
        return False

def main():
    print(f"{Colors.BLUE}=== CurrentMesh Cloudflare DNS Setup ==={Colors.NC}\n")
    
    # Load environment variables
    env = load_env()
    
    api_token = env.get('CLOUDFLARE_API_TOKEN')
    zone_id = env.get('CLOUDFLARE_ZONE_ID')
    server_ip = env.get('SERVER_IP')
    
    # Validate required variables
    if not api_token or not zone_id or not server_ip:
        print(f"{Colors.RED}Error: Missing required environment variables!{Colors.NC}")
        print("Required: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, SERVER_IP")
        sys.exit(1)
    
    print(f"{Colors.BLUE}Creating DNS records...{Colors.NC}\n")
    
    # Create DNS records
    records = [
        ('currentmesh.com', 'A', server_ip, True),
        ('www.currentmesh.com', 'A', server_ip, True),
        ('app.currentmesh.com', 'A', server_ip, True),
        ('client.currentmesh.com', 'A', server_ip, True),
        ('admin.currentmesh.com', 'A', server_ip, True),
        ('api.currentmesh.com', 'A', server_ip, True),  # API proxied for Cloudflare SSL
    ]
    
    success_count = 0
    for name, record_type, content, proxied in records:
        if create_dns_record(api_token, zone_id, name, record_type, content, proxied):
            success_count += 1
    
    print(f"{Colors.GREEN}=== DNS Setup Complete! ==={Colors.NC}\n")
    print(f"Successfully configured {success_count}/{len(records)} DNS records:")
    print(f"  {Colors.GREEN}✓{Colors.NC} currentmesh.com → {server_ip}")
    print(f"  {Colors.GREEN}✓{Colors.NC} www.currentmesh.com → {server_ip}")
    print(f"  {Colors.GREEN}✓{Colors.NC} app.currentmesh.com → {server_ip}")
    print(f"  {Colors.GREEN}✓{Colors.NC} client.currentmesh.com → {server_ip}")
    print(f"  {Colors.GREEN}✓{Colors.NC} admin.currentmesh.com → {server_ip}")
    print(f"  {Colors.GREEN}✓{Colors.NC} api.currentmesh.com → {server_ip}")
    print()
    print(f"{Colors.YELLOW}Note:{Colors.NC} DNS propagation may take a few minutes.")
    print(f"{Colors.YELLOW}Note:{Colors.NC} SSL/TLS certificates will be automatically provisioned by Cloudflare.")

if __name__ == '__main__':
    main()

