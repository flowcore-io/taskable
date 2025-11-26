'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ThemeProvider } from '@/src/components/theme-provider';
import { PWAInstallPrompt } from '@/src/components/PWAInstallPrompt';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider>
      <SessionProvider
        refetchInterval={5 * 60} // Refetch session every 5 minutes
        refetchOnWindowFocus={true} // Refetch when window regains focus
      >
        <QueryClientProvider client={queryClient}>
          {children}
          <PWAInstallPrompt />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
