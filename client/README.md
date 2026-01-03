# Client Collaboration Portal

Client-facing portal for viewing requests, submitting documents, and tracking request status.

## Subdomain
`client.currentmesh.com`

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui (to be added)

## Features (Planned)
- Client authentication (magic link)
- Client dashboard with request overview
- Request detail view
- Document upload interface
- Request status tracking
- Client communication interface
- Client document history
- Client settings and profile

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
client/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Magic link login
│   │   └── verify/         # Token verification
│   ├── (portal)/          # Portal routes (protected)
│   │   ├── dashboard/     # Client dashboard
│   │   └── layout.tsx     # Portal layout
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── auth/              # Authentication components
│   └── shared/            # Shared components
├── lib/                    # Utilities
│   ├── api.ts             # API client
│   └── auth.ts            # Auth utilities
└── types/                  # TypeScript types
```

## API Integration

Base URL: `http://localhost:3000/api` (development)

### Endpoints
- `POST /api/client-auth/magic-link/send` - Request magic link
- `POST /api/client-auth/magic-link/verify` - Verify token
- `GET /api/client/requests` - Get client's requests
- `GET /api/client/requests/:id` - Get request details
- `POST /api/client/requests/:id/upload` - Upload document
- `GET /api/client/documents` - List client's documents

## Related Epic
[[Epic 5: Client Collaboration Portal]]
