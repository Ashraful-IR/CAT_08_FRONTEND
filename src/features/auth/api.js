import { api } from "@/lib/api/client";
import { sessionResponseSchema } from "./schemas";

/**
 * GET /auth/session. `skip401Hook` because a 401 here *is* the signed-out
 * state, not an error to react to globally.
 */
export function getSession() {
  return api.get("/api/auth/session", sessionResponseSchema, { skip401Hook: true });
}

/** POST /auth/sign-out — clears the cookie server-side. */
export function signOut() {
  return api.post("/api/auth/sign-out");
}

/**
 * POST /auth/sign-up/email — creates the account; does NOT sign the user in
 * (API_CONTRACT: 201, user must sign in afterwards).
 */
export function signUp(values) {
  return api.post("/api/auth/sign-up/email", values, { skip401Hook: true });
}

/** POST /auth/sign-in/email — bad credentials arrive as 401; hook must not fire. */
export function signIn(values) {
  return api.post("/api/auth/sign-in/email", values, { skip401Hook: true });
}
