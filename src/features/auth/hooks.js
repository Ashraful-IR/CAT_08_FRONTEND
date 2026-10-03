"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getSession, signIn, signOut, signUp } from "./api";
import { safeNextPath } from "./next-path";

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
 * POST /auth/sign-up/email (Better Auth: 200 + sets the session cookie —
 * **the user is signed in immediately**). On success the ['session'] cache is
 * invalidated and the user lands on the validated `?next=` target — the
 * register→login hop from task 3.4 no longer applies, but the return target
 * still survives the whole flow via safeNextPath. Duplicate email arrives as
 * 422 `{message:"User already exists…"}`; components render it via
 * mutation.error and getErrorMessage().
 */
export function useSignUp() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: signUp,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Account created", {
        description: "You are signed in and ready to go.",
      });
      router.replace(safeNextPath(searchParams.get("next")));
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
