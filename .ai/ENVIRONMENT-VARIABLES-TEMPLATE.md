# Environment Variables Template

**⚠️ SECURITY WARNING**: This file contains sensitive information.  
**DO NOT commit to GitHub**. Keep this secure and share only with trusted agents.

---

## Required Environment Variables

### Backend (`server/.env.local`)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_BAJL6D0WyUTQ@ep-spring-snow-af038yg8-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secrets (GENERATE NEW ONES FOR SECURITY)
JWT_SECRET=<generate_64_char_hex_string>
JWT_REFRESH_SECRET=<generate_64_char_hex_string>

# Sentry
SENTRY_DSN=https://0dedf871efa867ac8a3fd3894a4edad3@o4510628533370880.ingest.us.sentry.io/4510628617191424
SENTRY_WEBHOOK_SECRET=<optional_webhook_secret>

# File Storage (S3 or Spaces)
S3_BUCKET=your_bucket_name
S3_REGION=us-west-2
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key

# Email (SendGrid/Brevo)
SENDGRID_API_KEY=your_sendgrid_api_key

# CORS
CORS_ORIGIN=http://localhost:5000,https://app.currentmesh.com,https://currentmesh.com
```

### Frontend Admin (`client/.env.local`)

```env
VITE_SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
```

### Marketing Site (`marketing/.env.local`)

```env
NEXT_PUBLIC_SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
```

### Sentry Config (`.env-config/.env`)

```env
SENTRY_AUTH_TOKEN=<your_sentry_auth_token>
SENTRY_ORG=4510628533370880
SENTRY_PROJECT=currentmesh
SENTRY_DSN=https://12653f0bbdf3799a81a884bfb018eb42@o4510628533370880.ingest.us.sentry.io/4510628587634688
```

### Cloudflare Config (`.cloudflare/.env`)

```env
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
SERVER_IP=your_droplet_ip_address
```

---

## Generate Secrets

### JWT Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Webhook Secret
```bash
openssl rand -hex 32
```

---

## ⚠️ Security Notes

- **Never commit** `.env` files to GitHub
- **Regenerate** JWT secrets for new deployments
- **Rotate** API keys periodically
- **Store** this document securely (password manager, encrypted file)
- **Share** only with trusted agents/developers

---

**Keep this file secure!** 🔐

