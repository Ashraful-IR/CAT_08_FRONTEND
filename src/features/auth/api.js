import { api } from "@/lib/api/client";
import { sessionResponseSchema, signUpPayload } from "./schemas";

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
 * POST /auth/sign-up/email (Better Auth). `values` are form values; the wire
 * body is built by signUpPayload (strips confirmPassword, maps photoURL →
 * image). A 200 also sets the session cookie — the user is signed in.
 */
export function signUp(values) {
  return api.post("/api/auth/sign-up/email", signUpPayload(values), {
    skip401Hook: true,
  });
}

/** POST /auth/sign-in/email — bad credentials arrive as 401; hook must not fire. */
export function signIn(values) {
  return api.post("/api/auth/sign-in/email", values, { skip401Hook: true });
}
