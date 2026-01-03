#!/usr/bin/env python3
"""
Cloudflare Free Features Configuration
Configures all available free Cloudflare features for optimal performance and security
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
    """Load environment variables from .cloudflare/.env file"""
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

def get_cloudflare_email():
    """Get Cloudflare account email"""
    email = os.getenv('CLOUDFLARE_EMAIL')
    if not email:
        print(f"{Colors.YELLOW}Cloudflare email not found in environment.{Colors.NC}")
        print(f"{Colors.BLUE}Please provide your Cloudflare account email:{Colors.NC}")
        email = input("Email: ").strip()
        if email:
            # Save to .env file
            env_path = Path(__file__).parent.parent / '.cloudflare' / '.env'
            with open(env_path, 'a') as f:
                f.write(f"\nCLOUDFLARE_EMAIL={email}\n")
            print(f"{Colors.GREEN}✅ Email saved to .cloudflare/.env{Colors.NC}")
    return email

def make_api_request(method, endpoint, zone_id=None, data=None, use_global_key=False):
    """Make API request to Cloudflare"""
    env = load_env()
    
    if use_global_key:
        # Use Global API Key + Email
        email = get_cloudflare_email()
        global_key = env.get('CLOUDFLARE_GLOBAL_API_KEY')
        if not global_key:
            print(f"{Colors.RED}Error: CLOUDFLARE_GLOBAL_API_KEY not found{Colors.NC}")
            sys.exit(1)
        headers = {
            'X-Auth-Email': email,
            'X-Auth-Key': global_key,
            'Content-Type': 'application/json'
        }
    else:
        # Use API Token
        api_token = env.get('CLOUDFLARE_API_TOKEN')
        if not api_token:
            print(f"{Colors.RED}Error: CLOUDFLARE_API_TOKEN not found{Colors.NC}")
            sys.exit(1)
        headers = {
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        }
    
    zone_id = zone_id or env.get('CLOUDFLARE_ZONE_ID')
    if not zone_id:
        print(f"{Colors.RED}Error: CLOUDFLARE_ZONE_ID not found{Colors.NC}")
        sys.exit(1)
    
    url = f'https://api.cloudflare.com/client/v4/zones/{zone_id}/{endpoint}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers)
        elif method == 'PATCH':
            response = requests.patch(url, headers=headers, json=data)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=data)
        else:
            response = requests.request(method, url, headers=headers, json=data)
        
        return response.json()
    except Exception as e:
        print(f"{Colors.RED}Error making API request: {e}{Colors.NC}")
        return None

def configure_ssl_tls(zone_id):
    """Configure SSL/TLS settings"""
    print(f"\n{Colors.BLUE}🔒 Configuring SSL/TLS...{Colors.NC}")
    
    # SSL Mode: Full
    result = make_api_request('PATCH', 'settings/ssl', zone_id, {'value': 'full'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ SSL Mode: Full{Colors.NC}")
    else:
        print(f"{Colors.YELLOW}⚠️  SSL Mode: {result.get('errors', [])}{Colors.NC}")
    
    # TLS 1.3
    result = make_api_request('PATCH', 'settings/tls_1_3', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ TLS 1.3: Enabled{Colors.NC}")
    
    # Minimum TLS Version: 1.2
    result = make_api_request('PATCH', 'settings/min_tls_version', zone_id, {'value': '1.2'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Minimum TLS: 1.2{Colors.NC}")

def configure_always_use_https(zone_id):
    """Enable Always Use HTTPS"""
    print(f"\n{Colors.BLUE}🔐 Configuring Always Use HTTPS...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/always_use_https', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Always Use HTTPS: Enabled{Colors.NC}")
    else:
        print(f"{Colors.YELLOW}⚠️  Always Use HTTPS: {result.get('errors', [])}{Colors.NC}")

def configure_automatic_https_rewrites(zone_id):
    """Enable Automatic HTTPS Rewrites"""
    print(f"\n{Colors.BLUE}🔄 Configuring Automatic HTTPS Rewrites...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/automatic_https_rewrites', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Automatic HTTPS Rewrites: Enabled{Colors.NC}")

def configure_minify(zone_id):
    """Configure Auto Minify"""
    print(f"\n{Colors.BLUE}📦 Configuring Auto Minify...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/minify', zone_id, {
        'value': {
            'html': 'on',
            'css': 'on',
            'javascript': 'on'
        }
    })
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Auto Minify: HTML, CSS, JS enabled{Colors.NC}")

def configure_brotli(zone_id):
    """Enable Brotli compression"""
    print(f"\n{Colors.BLUE}🗜️  Configuring Brotli Compression...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/brotli', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Brotli Compression: Enabled{Colors.NC}")

def configure_http2(zone_id):
    """Enable HTTP/2"""
    print(f"\n{Colors.BLUE}⚡ Configuring HTTP/2...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/http2', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ HTTP/2: Enabled{Colors.NC}")

def configure_http3(zone_id):
    """Enable HTTP/3 (with QUIC)"""
    print(f"\n{Colors.BLUE}🚀 Configuring HTTP/3 (QUIC)...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/http3', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ HTTP/3 (QUIC): Enabled{Colors.NC}")

def configure_0rtt(zone_id):
    """Enable 0-RTT Connection Resumption"""
    print(f"\n{Colors.BLUE}⚡ Configuring 0-RTT Connection Resumption...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/0rtt', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ 0-RTT: Enabled{Colors.NC}")

def configure_opportunistic_encryption(zone_id):
    """Enable Opportunistic Encryption"""
    print(f"\n{Colors.BLUE}🔐 Configuring Opportunistic Encryption...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/opportunistic_encryption', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Opportunistic Encryption: Enabled{Colors.NC}")

def configure_security_level(zone_id):
    """Configure Security Level"""
    print(f"\n{Colors.BLUE}🛡️  Configuring Security Level...{Colors.NC}")
    
    # Medium security level (balanced)
    result = make_api_request('PATCH', 'settings/security_level', zone_id, {'value': 'medium'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Security Level: Medium{Colors.NC}")

def configure_challenge_passage(zone_id):
    """Configure Challenge Passage"""
    print(f"\n{Colors.BLUE}⏱️  Configuring Challenge Passage...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/challenge_passage', zone_id, {'value': 1800})  # 30 minutes
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Challenge Passage: 30 minutes{Colors.NC}")

def configure_browser_integrity_check(zone_id):
    """Enable Browser Integrity Check"""
    print(f"\n{Colors.BLUE}🔍 Configuring Browser Integrity Check...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/browser_check', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Browser Integrity Check: Enabled{Colors.NC}")

def configure_privacy_pass(zone_id):
    """Enable Privacy Pass Support"""
    print(f"\n{Colors.BLUE}🔐 Configuring Privacy Pass...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/privacy_pass', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Privacy Pass: Enabled{Colors.NC}")

def configure_early_hints(zone_id):
    """Enable Early Hints"""
    print(f"\n{Colors.BLUE}⚡ Configuring Early Hints...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/early_hints', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Early Hints: Enabled{Colors.NC}")

def configure_enhanced_http2_prioritization(zone_id):
    """Enable Enhanced HTTP/2 Prioritization"""
    print(f"\n{Colors.BLUE}⚡ Configuring Enhanced HTTP/2 Prioritization...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/h2_prioritization', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Enhanced HTTP/2 Prioritization: Enabled{Colors.NC}")

def configure_certificate_transparency_monitoring(zone_id):
    """Enable Certificate Transparency Monitoring"""
    print(f"\n{Colors.BLUE}📋 Configuring Certificate Transparency Monitoring...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/certificate_transparency_monitoring', zone_id, {'value': 'on'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Certificate Transparency Monitoring: Enabled{Colors.NC}")

def configure_cache_level(zone_id):
    """Configure Cache Level"""
    print(f"\n{Colors.BLUE}💾 Configuring Cache Level...{Colors.NC}")
    
    # Standard cache level
    result = make_api_request('PATCH', 'settings/cache_level', zone_id, {'value': 'aggressive'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Cache Level: Aggressive{Colors.NC}")

def configure_browser_cache_ttl(zone_id):
    """Configure Browser Cache TTL"""
    print(f"\n{Colors.BLUE}⏱️  Configuring Browser Cache TTL...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/browser_cache_ttl', zone_id, {'value': 14400})  # 4 hours
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Browser Cache TTL: 4 hours{Colors.NC}")

def configure_development_mode(zone_id):
    """Disable Development Mode (keep it off for production)"""
    print(f"\n{Colors.BLUE}🔧 Configuring Development Mode...{Colors.NC}")
    
    result = make_api_request('PATCH', 'settings/development_mode', zone_id, {'value': 'off'})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Development Mode: Disabled (Production mode){Colors.NC}")

def purge_cache(zone_id):
    """Purge all cache"""
    print(f"\n{Colors.BLUE}🗑️  Purging Cloudflare cache...{Colors.NC}")
    
    result = make_api_request('POST', 'purge_cache', zone_id, {'purge_everything': True})
    if result and result.get('success'):
        print(f"{Colors.GREEN}✅ Cache purged successfully{Colors.NC}")
    else:
        print(f"{Colors.YELLOW}⚠️  Cache purge: {result.get('errors', [])}{Colors.NC}")

def main():
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.BLUE}Cloudflare Free Features Configuration{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")
    
    env = load_env()
    zone_id = env.get('CLOUDFLARE_ZONE_ID')
    
    if not zone_id:
        print(f"{Colors.RED}Error: CLOUDFLARE_ZONE_ID not found{Colors.NC}")
        sys.exit(1)
    
    print(f"{Colors.BLUE}Zone ID: {zone_id}{Colors.NC}\n")
    
    # Configure all free features
    configure_ssl_tls(zone_id)
    configure_always_use_https(zone_id)
    configure_automatic_https_rewrites(zone_id)
    configure_minify(zone_id)
    configure_brotli(zone_id)
    configure_http2(zone_id)
    configure_http3(zone_id)
    configure_0rtt(zone_id)
    configure_opportunistic_encryption(zone_id)
    configure_security_level(zone_id)
    configure_challenge_passage(zone_id)
    configure_browser_integrity_check(zone_id)
    configure_privacy_pass(zone_id)
    configure_early_hints(zone_id)
    configure_enhanced_http2_prioritization(zone_id)
    configure_certificate_transparency_monitoring(zone_id)
    configure_cache_level(zone_id)
    configure_browser_cache_ttl(zone_id)
    configure_development_mode(zone_id)
    
    # Purge cache at the end
    purge_cache(zone_id)
    
    print(f"\n{Colors.GREEN}{'='*60}{Colors.NC}")
    print(f"{Colors.GREEN}✅ Cloudflare configuration complete!{Colors.NC}")
    print(f"{Colors.GREEN}{'='*60}{Colors.NC}\n")
    print(f"{Colors.BLUE}All free Cloudflare features have been enabled.{Colors.NC}")
    print(f"{Colors.YELLOW}Note: Changes may take a few minutes to propagate.{Colors.NC}\n")

if __name__ == '__main__':
    main()


