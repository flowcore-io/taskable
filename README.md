# Taskable

A Google Keep-inspired todo application powered by Usable fragments.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **NextAuth** - Authentication with Keycloak
- **TanStack Query** - Server state management
- **Tailwind CSS 4** - Styling
- **TypeScript** - Type safety
- **Biome** - Linting and formatting
- **PWA Support** - Installable on mobile and desktop devices

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

## Features

- 📱 **Progressive Web App (PWA)** - Install on your phone or desktop!
- ✨ **Offline Support** - Works without internet connection
- 🎨 **Google Keep-inspired** - Familiar masonry grid layout
- 🔐 **Secure Authentication** - Keycloak integration
- 💾 **Persistent Storage** - Todos backed by Usable fragments
- 🌓 **Dark Mode** - Automatic theme switching

## Development

- **Lint**: `yarn lint`
- **Format**: `yarn format`
- **Build**: `yarn build`
- **Start**: `yarn start`
- **Generate Icons**: `yarn generate:icons`

## PWA Installation

Taskable can be installed as a Progressive Web App on phones, tablets, and desktops:

### Automatic Install Prompt
When you first visit Taskable, you'll see a friendly popup asking if you want to install the app. Just click "Install" and you're done! 🎉

### Manual Installation

#### Mobile
1. Open Taskable in your mobile browser
2. Look for "Add to Home Screen" option
3. Tap to install - it will appear like a native app!

#### Desktop
1. Open Taskable in Chrome/Edge
2. Look for the install icon (⊕) in the address bar
3. Click "Install" to add to your apps

**Note**: PWA features require HTTPS in production (automatically handled by Vercel/Netlify).

For detailed PWA setup and configuration, see [PWA_SETUP.md](./PWA_SETUP.md).

## Testing Keycloak + Usable API

A standalone test client is available in `/keycloak-test-client` to verify Keycloak authentication with the Usable API. This helps isolate and test the authentication flow independently.

```bash
cd keycloak-test-client
npm install
npm run dev
```

See `keycloak-test-client/README.md` and `keycloak-test-client/TESTING_GUIDE.md` for details.

## Deployment

Deploy to Vercel with one click or via Git integration. See `ENV_SETUP.md` for environment variable configuration.

## License

MIT
