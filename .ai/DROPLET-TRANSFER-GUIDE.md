# DigitalOcean Droplet Transfer Guide

**Difficulty**: Medium (requires downtime and manual steps)  
**Time**: 1-2 hours depending on droplet size

---

## ⚠️ Important: No Direct Transfer

DigitalOcean **does not support** direct droplet transfer between accounts. You need to use one of these methods:

---

## Method 1: Snapshot & Recreate (Recommended)

### Difficulty: ⭐⭐ (Easy-Medium)
### Downtime: 30-60 minutes

### Steps:

1. **Create Snapshot** (in old account)
   ```bash
   # Via DigitalOcean Dashboard:
   # Droplet → Snapshots → Take Snapshot
   # OR via API/CLI
   ```

2. **Export Snapshot** (if needed)
   - Download snapshot image
   - Or use DigitalOcean's export feature

3. **Import to New Account**
   - Upload snapshot to new account
   - Create new droplet from snapshot

4. **Update DNS/Config**
   - Point domains to new droplet IP
   - Update any hardcoded IPs
   - Update firewall rules

5. **Verify & Test**
   - Test all services
   - Verify data integrity
   - Update monitoring/backups

### Pros:
- ✅ Preserves all data and configuration
- ✅ Relatively straightforward
- ✅ Can test before switching DNS

### Cons:
- ❌ Requires downtime
- ❌ New IP address (DNS propagation delay)
- ❌ Need to update all IP references

---

## Method 2: Manual Recreation (More Control)

### Difficulty: ⭐⭐⭐ (Medium)
### Downtime: 1-2 hours

### Steps:

1. **Document Current Setup**
   - List installed packages
   - Document configuration files
   - Export database
   - Backup application code
   - Document environment variables

2. **Create New Droplet** (in new account)
   - Same OS version
   - Same or larger size

3. **Recreate Environment**
   - Install packages
   - Restore configuration
   - Restore database
   - Deploy application code
   - Configure services (Nginx, PM2, etc.)

4. **Update DNS & Test**
   - Point domains to new droplet
   - Test all functionality

### Pros:
- ✅ Clean slate (remove unused packages)
- ✅ Opportunity to improve setup
- ✅ Full control over configuration

### Cons:
- ❌ More time-consuming
- ❌ Risk of missing configurations
- ❌ Requires good documentation

---

## Method 3: Support Request (Enterprise)

### Difficulty: ⭐ (Easy, if available)
### Downtime: Minimal

### Steps:

1. **Contact DigitalOcean Support**
   - Request account transfer
   - Provide both account details
   - Explain business reason

2. **Support Process**
   - They may transfer billing
   - Or help with snapshot process
   - Usually for enterprise customers

### Pros:
- ✅ Potentially no downtime
- ✅ Support assistance

### Cons:
- ❌ May not be available for all accounts
- ❌ May require enterprise plan
- ❌ Takes time for support response

---

## Recommended Approach for CurrentMesh

### Use Method 1 (Snapshot & Recreate)

**Why?**
- You have Cloudflare (easy DNS update)
- Relatively simple setup
- Preserves all configurations
- Can test before going live

**Steps:**

1. **Before Transfer:**
   ```bash
   # Document current setup
   dpkg -l > installed-packages.txt
   crontab -l > crontab-backup.txt
   pm2 save  # Save PM2 processes
   ```

2. **Create Snapshot:**
   - DigitalOcean Dashboard → Droplet → Snapshots
   - Name: "currentmesh-transfer-YYYY-MM-DD"
   - Wait for completion

3. **Export Snapshot** (if needed):
   - Download or note snapshot ID
   - May need to contact support for cross-account access

4. **New Account:**
   - Create droplet from snapshot
   - Note new IP address

5. **Update Cloudflare:**
   - Update A records to new IP
   - Wait for DNS propagation (usually < 5 min with Cloudflare)

6. **Verify:**
   - Test all sites
   - Check services running
   - Verify database connections

---

## Cost Considerations

- **Snapshot Storage**: ~$0.05/GB/month
- **New Droplet**: Same pricing as current
- **Transfer Time**: Usually free (within same region)

---

## Important Notes

### ⚠️ Before Transfer:

1. **Backup Everything**
   - Database (Neon - already cloud, but verify)
   - Application code (Git - already backed up)
   - Configuration files
   - Environment variables

2. **Document Dependencies**
   - Installed packages
   - Service configurations
   - Cron jobs
   - Firewall rules

3. **Plan Downtime**
   - Schedule during low-traffic period
   - Notify users if needed
   - Have rollback plan

### ✅ After Transfer:

1. **Verify Services**
   - Nginx running
   - PM2 processes active
   - Database connections
   - SSL certificates valid

2. **Update Monitoring**
   - Update Sentry (if IP-based)
   - Update any monitoring tools
   - Update backup scripts

3. **Test Everything**
   - All websites accessible
   - API endpoints working
   - Database queries successful
   - File uploads working

---

## Quick Checklist

- [ ] Create snapshot of current droplet
- [ ] Document all configurations
- [ ] Backup database (verify Neon backup)
- [ ] Export environment variables
- [ ] Create new droplet from snapshot
- [ ] Update Cloudflare DNS records
- [ ] Verify SSL certificates
- [ ] Test all services
- [ ] Update monitoring/backups
- [ ] Delete old droplet (after verification)

---

## Estimated Time

- **Snapshot Creation**: 10-30 minutes
- **Droplet Creation**: 5-10 minutes
- **DNS Propagation**: 1-5 minutes (Cloudflare)
- **Testing**: 15-30 minutes
- **Total**: ~1-2 hours

---

**Recommendation**: Use snapshot method. With Cloudflare, DNS updates are instant, making the transfer relatively smooth.

