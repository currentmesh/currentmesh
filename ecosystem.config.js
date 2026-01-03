module.exports = {
  apps: [
    {
      name: 'currentmesh-server',
      script: 'npx',
      args: 'tsx src/index.ts',
      cwd: '/var/www/currentmesh/server',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/var/www/currentmesh/logs/server-err.log',
      out_file: '/var/www/currentmesh/logs/server-out.log',
      log_file: '/var/www/currentmesh/logs/server-combined.log',
      time: true,
      autorestart: true,
      min_uptime: '30s', // Increased from 10s to 30s to prevent rapid restarts
      max_restarts: 15, // Increased from 10 to 15
      restart_delay: 10000, // Increased from 5000ms to 10000ms
      kill_timeout: 10000, // Increased from 5000ms to 10000ms for graceful shutdown
      max_memory_restart: '512M', // Restart if memory exceeds 512MB
      listen_timeout: 10000, // Wait 10s for server to start
      shutdown_with_message: true // Graceful shutdown
    },
    {
      name: 'currentmesh-marketing',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/currentmesh/marketing',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOSTNAME: '0.0.0.0',
        NODE_OPTIONS: '--max-old-space-size=1536 --no-experimental-fetch',
        NEXT_TELEMETRY_DISABLED: '1' // Disable telemetry to reduce memory
      },
      error_file: '/var/www/currentmesh/logs/marketing-err.log',
      out_file: '/var/www/currentmesh/logs/marketing-out.log',
      log_file: '/var/www/currentmesh/logs/marketing-combined.log',
      time: true,
      max_memory_restart: '1400M', // Reduced to prevent OOM kills
      min_uptime: '90s', // Increased to 90s to allow full compilation
      max_restarts: 20, // More restarts allowed
      restart_delay: 20000, // 20s delay between restarts
      kill_timeout: 20000, // 20s for graceful shutdown
      listen_timeout: 30000, // 30s for Next.js to start
      autorestart: true,
      shutdown_with_message: true,
      wait_ready: true,
      exp_backoff_restart_delay: 100,
      merge_logs: true
    },
    {
      name: 'currentmesh-app',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/currentmesh/app',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/var/www/currentmesh/logs/app-err.log',
      out_file: '/var/www/currentmesh/logs/app-out.log',
      log_file: '/var/www/currentmesh/logs/app-combined.log',
      time: true,
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '512M',
      kill_timeout: 5000
    },
    {
      name: 'currentmesh-client',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/currentmesh/client',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
        HOSTNAME: '0.0.0.0',
        NODE_OPTIONS: '--max-old-space-size=1400'
      },
      error_file: '/var/www/currentmesh/logs/client-err.log',
      out_file: '/var/www/currentmesh/logs/client-out.log',
      log_file: '/var/www/currentmesh/logs/client-combined.log',
      time: true,
      max_memory_restart: '800M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 2000,
      autorestart: true
    },
    {
      name: 'currentmesh-admin',
      script: 'npm',
      args: 'run dev',
      cwd: '/var/www/currentmesh/admin',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 5002,
        HOSTNAME: '0.0.0.0'
      },
      error_file: '/var/www/currentmesh/logs/admin-err.log',
      out_file: '/var/www/currentmesh/logs/admin-out.log',
      log_file: '/var/www/currentmesh/logs/admin-combined.log',
      time: true,
      autorestart: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '512M',
      kill_timeout: 5000
    }
  ]
};

