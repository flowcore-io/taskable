# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Usable API URL (base URL without /api path)
USABLE_API_URL=https://usable.dev

# Keycloak Configuration
# Use the existing memory-mesh-app client (confidential client)
KEYCLOAK_CLIENT_ID=memory-mesh-app
KEYCLOAK_CLIENT_SECRET=<get-from-keycloak-admin>
KEYCLOAK_ISSUER=https://auth.flowcore.io/realms/memory-mesh

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-command-below>
```

## Getting Keycloak Credentials

### Client ID and Secret

1. The app uses the **existing** `memory-mesh-app` Keycloak client
2. This is a **confidential client** (not public PKCE)
3. Get the `KEYCLOAK_CLIENT_SECRET` from:
   - Keycloak Admin Console
   - Navigate to: Clients → memory-mesh-app → Credentials
   - Copy the "Secret" value

### Keycloak Issuer

- **Keycloak URL**: `https://auth.flowcore.io`
- **Realm**: `memory-mesh`
- **Full Issuer**: `https://auth.flowcore.io/realms/memory-mesh`

## Generating NextAuth Secret

Generate a secure random secret with OpenSSL:

```bash
openssl rand -base64 32
```

Copy the output and set it as `NEXTAUTH_SECRET` in your `.env.local` file.

## Example `.env.local`

```bash
# Base URL without /api path - routes will append /api/* automatically
USABLE_API_URL=https://usable.dev
KEYCLOAK_CLIENT_ID=memory-mesh-app
KEYCLOAK_CLIENT_SECRET=abc123def456ghi789...
KEYCLOAK_ISSUER=https://auth.flowcore.io/realms/memory-mesh
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
```

## Vercel Deployment

When deploying to Vercel:

1. Go to Project Settings → Environment Variables
2. Add all variables from above
3. **Important**: Set `NEXTAUTH_URL` to your production URL (e.g., `https://taskable.vercel.app`)
4. Vercel will auto-set `NEXTAUTH_URL` based on your deployment URL, but explicit is better

## Security Notes

- ✅ **Never commit** `.env.local` to Git (it's in `.gitignore`)
- ✅ **Use httpOnly cookies** - NextAuth handles this automatically
- ✅ **T3 Env validation** - Environment variables are validated at build time
- ✅ **Server-side only** - Secrets never exposed to the browser

## Troubleshooting

### "Invalid environment variables" error

- Check that all required variables are set in `.env.local`
- Ensure there are no trailing spaces or quotes
- Restart the dev server after changing `.env.local`

### "Unauthorized" error when calling API

- Verify `KEYCLOAK_CLIENT_SECRET` is correct
- Check that you're using the `memory-mesh-app` client (not `taskable-app`)
- Ensure `USABLE_API_URL` is correct (`https://usable.dev`)

### NextAuth session errors

- Regenerate `NEXTAUTH_SECRET` if you suspect it's invalid
- Clear browser cookies and try signing in again
- Check `NEXTAUTH_URL` matches your current environment
