# Memory Optimizations Applied

**Date**: December 31, 2025  
**Purpose**: Reduce app crashes due to memory constraints

---

## ✅ Optimizations Applied

### 1. Increased Node.js Heap Size
- **Before**: `--max-old-space-size=1024` (1GB)
- **After**: `--max-old-space-size=1400` (1.4GB)
- **Location**: `/var/www/currentmesh/ecosystem.config.js`
- **Benefit**: More memory available for Next.js compilation

### 2. Added Memory Optimization Flag
- **Added**: `--optimize-for-size` to NODE_OPTIONS
- **Benefit**: Reduces memory footprint of Node.js runtime

### 3. Increased PM2 Memory Limit
- **Before**: `max_memory_restart: '500M'`
- **After**: `max_memory_restart: '800M'`
- **Location**: `/var/www/currentmesh/ecosystem.config.js`
- **Benefit**: Allows app to use more memory before restarting

### 4. Enabled Memory Overcommit
- **Setting**: `vm.overcommit_memory=1`
- **Location**: `/etc/sysctl.conf`
- **Benefit**: Allows more aggressive memory allocation, better for compilation

### 5. Increased Overcommit Ratio
- **Before**: 50% (default)
- **After**: 80%
- **Location**: `/etc/sysctl.conf`
- **Benefit**: Allows system to allocate more memory than physical RAM

### 6. Disabled Next.js Telemetry
- **Setting**: `NEXT_TELEMETRY_DISABLED=1`
- **Location**: `/var/www/currentmesh/marketing/.env.local`
- **Benefit**: Reduces memory usage and improves performance

### 7. Added NODE_OPTIONS to .env.local
- **Setting**: `NODE_OPTIONS=--max-old-space-size=1400`
- **Location**: `/var/www/currentmesh/marketing/.env.local`
- **Benefit**: Ensures consistent memory limits across all Node processes

---

## 📊 Current Memory Configuration

**System Memory:**
- Total RAM: 1.9GB
- Swap: 4GB
- Swappiness: 10

**Node.js Memory:**
- Heap Size: 1.4GB (increased from 1GB)
- PM2 Restart Limit: 800MB (increased from 500MB)

**System Settings:**
- Memory Overcommit: Enabled (1)
- Overcommit Ratio: 80% (increased from 50%)

---

## 🔍 Monitoring

To check if optimizations are working:

```bash
# Check PM2 status
pm2 status

# Check memory usage
free -h

# Check app logs
pm2 logs currentmesh-marketing

# Check if app is responding
curl -I http://localhost:3000
```

---

## ⚠️ Notes

1. **Memory Overcommit**: Enabling overcommit allows the system to allocate more memory than physically available. This is safe because:
   - Most allocations are virtual and not immediately used
   - Swap file (4GB) provides backup
   - PM2 will restart if memory gets too high

2. **Heap Size**: 1.4GB is close to the system limit (1.9GB RAM), but:
   - Swap provides additional 4GB
   - Other processes need ~500MB
   - This should be sufficient for compilation

3. **If Still Crashing**: Consider:
   - Upgrading droplet to 4GB RAM
   - Building in production mode instead of dev mode
   - Reducing Next.js features/plugins

---

## 📝 Files Modified

1. `/var/www/currentmesh/ecosystem.config.js`
   - Increased NODE_OPTIONS heap size
   - Increased max_memory_restart
   - Added --optimize-for-size flag

2. `/var/www/currentmesh/marketing/.env.local`
   - Added NEXT_TELEMETRY_DISABLED=1
   - Added NODE_OPTIONS=--max-old-space-size=1400

3. `/etc/sysctl.conf`
   - Added vm.overcommit_memory=1
   - Added vm.overcommit_ratio=80

---

**All optimizations are persistent and will survive reboots!**


