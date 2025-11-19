# Taskable

A Google Keep-inspired todo application powered by Usable fragments.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **NextAuth** - Authentication with Keycloak
- **TanStack Query** - Server state management
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety
- **Biome** - Linting and formatting

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn
- Keycloak client credentials (`memory-mesh-app`)

### Setup

1. Install dependencies:
```bash
yarn install
```

2. Create `.env.local` file (see `ENV_SETUP.md` for details):
```bash
USABLE_API_URL=https://usable.dev
KEYCLOAK_CLIENT_ID=memory-mesh-app
KEYCLOAK_CLIENT_SECRET=<from-keycloak>
KEYCLOAK_ISSUER=https://auth.flowcore.io/realms/memory-mesh
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl>
```

3. Run development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── api/                   # API routes
│   ├── auth/             # NextAuth handlers
│   └── usable/           # Usable API proxies
├── layout.tsx            # Root layout
├── page.tsx              # Dashboard page
└── globals.css           # Global styles

src/
├── features/             # Feature modules
│   ├── onboarding/      # First-time setup
│   ├── todos/           # Todo management
│   └── templates/       # Template management
├── lib/                  # Shared libraries
│   ├── usable-api/      # API client
│   └── storage/         # LocalStorage utils
└── components/           # UI components

lib/
├── auth.ts               # NextAuth config
└── env.ts                # Environment validation
```

## Development

- **Lint**: `yarn lint`
- **Format**: `yarn format`
- **Build**: `yarn build`
- **Start**: `yarn start`

## Deployment

Deploy to Vercel with one click or via Git integration. See `ENV_SETUP.md` for environment variable configuration.

## License

MIT
