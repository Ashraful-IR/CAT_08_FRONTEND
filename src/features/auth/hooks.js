"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSession, signIn, signOut, signUp } from "./api";

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
    queryFn: getSession,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * POST /auth/sign-out, then clear every query cache and go home
 * (SECURITY_AND_AUTH → Session model). Cache clearing uses a fresh client
 * reference so callers render signed-out immediately.
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      queryClient.removeQueries();
      router.replace("/");
    },
  });
}

/**
 * POST /auth/sign-up/email. On 201 the user is NOT signed in — they are sent
 * to /login with a success toast (SECURITY_AND_AUTH → Session model).
 */
export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      toast.success("Account created", {
        description: "Sign in with your new credentials to continue.",
      });
      router.replace("/login");
    },
    onError: () => {
      // The API client already normalised this to a user-presentable message;
      // components render it via mutation.error and getErrorMessage().
    },
  });
}

/**
 * POST /auth/sign-in/email — the backend sets the httpOnly cookie. The
 * `next` param (validated) decides where the user lands afterwards.
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signIn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
