'use client';

import { useSession, signIn } from 'next-auth/react';
import { Dashboard } from '@/components/Dashboard';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-8">
            {/* Mascot and branding */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-48 h-48 relative">
                  <img
                    src="/usable-logo.webp"
                    alt="Usable Mascot"
                    className="w-full h-full object-contain animate-bounce-subtle"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-6xl font-bold text-foreground tracking-tight">
                  Taskable
                </h1>
                <p className="text-xl text-muted-foreground font-light">
                  Usable as a Todo list
                </p>
              </div>
            </div>

            {/* Login button */}
            <div className="pt-4">
              <button
                onClick={() => signIn('keycloak', { callbackUrl: '/' })}
                className="group relative w-full max-w-xs mx-auto block px-8 py-4 text-lg font-semibold bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login with Usable
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </div>

            {/* Footer */}
            <div className="pt-12">
              <p className="text-sm text-muted-foreground font-light">
                powered by <span className="font-semibold text-secondary">usable.dev</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
