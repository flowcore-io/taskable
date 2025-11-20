import KeycloakProvider from 'next-auth/providers/keycloak';
import type { NextAuthOptions } from 'next-auth';
import { env } from '@/lib/env';

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_ISSUER,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, account, trigger }) {
      // Initial sign in - store tokens
      if (account) {
        console.log('JWT callback - storing tokens:', {
          hasAccount: !!account,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
        });
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        return token;
      }

      // Check if token is expired and refresh if needed
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000) {
        // Token is still valid
        return token;
      }

      // Token expired, try to refresh
      if (token.refreshToken) {
        try {
          console.log('Refreshing access token...');
          const response = await fetch(`${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: env.KEYCLOAK_CLIENT_ID,
              client_secret: env.KEYCLOAK_CLIENT_SECRET,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken as string,
            }),
          });

          if (response.ok) {
            const refreshedTokens = await response.json();
            console.log('Token refreshed successfully');
            return {
              ...token,
              accessToken: refreshedTokens.access_token,
              refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
              expiresAt: Math.floor(Date.now() / 1000) + (refreshedTokens.expires_in || 3600),
            };
          } else {
            console.error('Failed to refresh token:', response.status, await response.text());
            // Return token anyway - will fail on API call but user can re-authenticate
            return token;
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          return token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', {
        hasTokenAccessToken: !!token.accessToken,
        expiresAt: token.expiresAt,
        isExpired: token.expiresAt ? Date.now() >= (token.expiresAt as number) * 1000 : 'unknown',
      });
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};
