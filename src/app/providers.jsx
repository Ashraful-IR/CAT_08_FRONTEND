"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setUnauthorizedHandler } from "@/lib/api/client";

/**
 * App-wide client providers (ARCHITECTURE → one QueryClientProvider).
 * staleTime avoids refetch storms; retry:false so 401/404 surfaces fast.
 *
 * Also registers the global 401 handler (API_CONTRACT → Status-code handling,
 * SECURITY_AND_AUTH): any API call answered 401 while signed out clears the
 * session cache and redirects to /login?next=<current path>. Registered once,
 * inside the Router context, so the handler can build the return path.
 */
export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.removeQueries({ queryKey: ["session"] });
      const { pathname, search } = window.location;
      router.replace(`/login?next=${encodeURIComponent(pathname + search)}`);
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
