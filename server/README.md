# CurrentMesh Backend API

**Framework**: Express.js + TypeScript  
**Database**: PostgreSQL (Neon Cloud)  
**Error Tracking**: Sentry

---

## Quick Start

### Development
```bash
cd /var/www/currentmesh/server
npm run dev
# Server runs on http://localhost:3000
```

### Production
```bash
npm run build
npm start
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SENTRY_DSN=your_sentry_dsn
```

---

## Project Structure

```
server/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/               # Configuration
│   │   ├── env.ts           # Environment variables
│   │   └── database.ts      # Database connection
│   ├── routes/              # API routes
│   ├── controllers/        # Route handlers
│   ├── services/            # Business logic
│   ├── middleware/          # Express middleware
│   ├── db/                  # Database queries
│   ├── utils/               # Utilities
│   └── types/               # TypeScript types
├── package.json
└── tsconfig.json
```

---

## API Endpoints

### Health Check
- `GET /health` - Server health status
- `GET /api` - API information

### Authentication (TODO)
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Requests (TODO)
- `GET /api/requests`
- `POST /api/requests`
- `GET /api/requests/:id`
- `PUT /api/requests/:id`
- `DELETE /api/requests/:id`

---

## Features

- ✅ Express.js + TypeScript
- ✅ PostgreSQL connection (Neon)
- ✅ Sentry error tracking
- ✅ Security middleware (Helmet, CORS)
- ✅ Rate limiting
- ✅ Request logging
- ✅ Error handling

---

## Next Steps

1. Create authentication routes
2. Create request management routes
3. Set up file upload handling
4. Add Socket.io for real-time features
5. Implement database migrations

---

**Backend API Ready!** 🚀

