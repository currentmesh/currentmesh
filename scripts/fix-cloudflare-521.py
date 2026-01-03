#!/usr/bin/env python3
"""
Fix Cloudflare 521 Error
Temporarily disable proxy to test direct connection, then re-enable
"""

import os
import sys
import json
import requests
from pathlib import Path

class Colors:
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'

def load_env():
    env_path = Path(__file__).parent.parent / '.cloudflare' / '.env'
    if not env_path.exists():
        print(f"{Colors.RED}Error: .cloudflare/.env not found{Colors.NC}")
        sys.exit(1)
    
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    return env_vars

def get_cloudflare_email():
    email = os.getenv('CLOUDFLARE_EMAIL')
    if not email:
        env = load_env()
        email = env.get('CLOUDFLARE_EMAIL')
    if not email:
        print(f"{Colors.YELLOW}Cloudflare email not found. Please provide:{Colors.NC}")
        email = input("Email: ").strip()
        if email:
            env_path = Path(__file__).parent.parent / '.cloudflare' / '.env'
            with open(env_path, 'a') as f:
                f.write(f"\nCLOUDFLARE_EMAIL={email}\n")
    return email

def update_dns_record(zone_id, record_id, name, content, proxied, use_global_key=False):
    env = load_env()
    
    if use_global_key:
        email = get_cloudflare_email()
        global_key = env.get('CLOUDFLARE_GLOBAL_API_KEY')
        headers = {
            'X-Auth-Email': email,
            'X-Auth-Key': global_key,
            'Content-Type': 'application/json'
        }
    else:
        api_token = env.get('CLOUDFLARE_API_TOKEN')
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
    
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}'
    data = {
        'type': 'A',
        'name': name,
        'content': content,
        'proxied': proxied
    }
    
    response = requests.put(url, headers=headers, json=data)
    return response.json()

def get_dns_record(zone_id, name, use_global_key=False):
    env = load_env()
    
    if use_global_key:
        email = get_cloudflare_email()
        global_key = env.get('CLOUDFLARE_GLOBAL_API_KEY')
        headers = {
            'X-Auth-Email': email,
            'X-Auth-Key': global_key,
            'Content-Type': 'application/json'
        }
    else:
        api_token = env.get('CLOUDFLARE_API_TOKEN')
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
    
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?name={name}'
    response = requests.get(url, headers=headers)
    return response.json()

def main():
    print(f"{Colors.BLUE}=== Fixing Cloudflare 521 Error ==={Colors.NC}\n")
    
    env = load_env()
    zone_id = env.get('CLOUDFLARE_ZONE_ID')
    server_ip = env.get('SERVER_IP')
    
    if not zone_id or not server_ip:
        print(f"{Colors.RED}Error: Missing ZONE_ID or SERVER_IP{Colors.NC}")
        sys.exit(1)
    
    # Get current DNS record
    print(f"{Colors.BLUE}Getting current DNS record...{Colors.NC}")
    result = get_dns_record(zone_id, 'api.currentmesh.com', use_global_key=True)
    
    if not result.get('success') or not result.get('result'):
        print(f"{Colors.RED}Error: Could not get DNS record{Colors.NC}")
        print(result)
        sys.exit(1)
    
    record = result['result'][0]
    record_id = record['id']
    current_proxied = record['proxied']
    
    print(f"{Colors.YELLOW}Current: proxied={current_proxied}{Colors.NC}\n")
    
    # Temporarily disable proxy to test direct connection
    print(f"{Colors.BLUE}Step 1: Temporarily disabling Cloudflare proxy...{Colors.NC}")
    result = update_dns_record(zone_id, record_id, 'api.currentmesh.com', server_ip, False, use_global_key=True)
    
    if result.get('success'):
        print(f"{Colors.GREEN}✅ Proxy disabled (DNS-only mode){Colors.NC}")
        print(f"{Colors.YELLOW}Waiting 30 seconds for DNS propagation...{Colors.NC}\n")
        
        import time
        time.sleep(30)
        
        # Test direct connection
        print(f"{Colors.BLUE}Step 2: Testing direct connection...{Colors.NC}")
        import subprocess
        test_result = subprocess.run(
            ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', f'http://{server_ip}/health', '-H', 'Host: api.currentmesh.com'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if test_result.stdout == '200':
            print(f"{Colors.GREEN}✅ Direct connection works!{Colors.NC}\n")
            
            # Re-enable proxy
            print(f"{Colors.BLUE}Step 3: Re-enabling Cloudflare proxy...{Colors.NC}")
            result = update_dns_record(zone_id, record_id, 'api.currentmesh.com', server_ip, True, use_global_key=True)
            
            if result.get('success'):
                print(f"{Colors.GREEN}✅ Proxy re-enabled{Colors.NC}")
                print(f"{Colors.YELLOW}Waiting 30 seconds for DNS propagation...{Colors.NC}\n")
                time.sleep(30)
                
                print(f"{Colors.GREEN}=== Fix Complete ==={Colors.NC}")
                print(f"{Colors.BLUE}Cloudflare should now be able to connect.{Colors.NC}")
                print(f"{Colors.YELLOW}If 521 persists, wait 5-10 minutes for full propagation.{Colors.NC}\n")
            else:
                print(f"{Colors.RED}❌ Failed to re-enable proxy: {result.get('errors', [])}{Colors.NC}")
        else:
            print(f"{Colors.RED}❌ Direct connection failed: HTTP {test_result.stdout}{Colors.NC}")
            print(f"{Colors.YELLOW}Server may not be accessible from outside.{Colors.NC}")
    else:
        print(f"{Colors.RED}❌ Failed to update DNS: {result.get('errors', [])}{Colors.NC}")
        print(f"{Colors.YELLOW}Trying with API token instead...{Colors.NC}")
        
        # Try with API token (may have different permissions)
        result = get_dns_record(zone_id, 'api.currentmesh.com', use_global_key=False)
        if result.get('success'):
            print(f"{Colors.GREEN}✅ Can read DNS with API token{Colors.NC}")
            print(f"{Colors.YELLOW}Note: API token may not have write permissions.{Colors.NC}")
            print(f"{Colors.YELLOW}Please update DNS manually in Cloudflare dashboard:{Colors.NC}")
            print(f"{Colors.BLUE}1. Go to DNS settings for api.currentmesh.com{Colors.NC}")
            print(f"{Colors.BLUE}2. Click the orange cloud to disable proxy (gray cloud = DNS-only){Colors.NC}")
            print(f"{Colors.BLUE}3. Wait 5 minutes, then re-enable proxy{Colors.NC}")

if __name__ == '__main__':
    main()


