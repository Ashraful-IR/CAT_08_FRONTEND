"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { sessionResponseSchema } from "./schemas";

/**
 * Source of truth for "who am I" (SECURITY_AND_AUTH): GET /api/auth/session
 * through the proxy. 401 ⇒ logged out. staleTime 5 min, no retry.
 *
 * @returns {{
 *   user: import("./schemas").SessionUser | null,
 *   isLoading: boolean,
 *   error: unknown,
 * }}
 */
export function useSession() {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: () => api.get("/api/auth/session", sessionResponseSchema, { skip401Hook: true }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
