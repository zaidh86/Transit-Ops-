"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import { ApiClientError } from "@/lib/api";

export function Providers({ children }: { children: ReactNode }) {
  // Created once per mount rather than at module scope, so that server renders
  // never share a cache between requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 4xx responses are decisions, not glitches: a 401, 403, 404 or a
              // 409 business-rule refusal will say the same thing every time.
              // Retrying them just delays the error the user needs to see.
              if (
                error instanceof ApiClientError &&
                error.status >= 400 &&
                error.status < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
