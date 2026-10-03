import { z } from "zod";

/**
 * Session user per API_CONTRACT (id, name, email, photoURL — the compat
 * `/auth/session` alias maps Better Auth's `image` to `photoURL`). The
 * backend may attach extra fields; the schema validates the documented
 * subset and passes the rest through so callers never crash on extensions.
 */
export const sessionUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    photoURL: z.string(),
  })
  .passthrough();

/** @typedef {z.infer<typeof sessionUserSchema>} SessionUser */

export const sessionResponseSchema = z.object({
  user: sessionUserSchema,
});

/**
 * Backend password rule, mirrored from API_CONTRACT → Auth: Better Auth
 * runs with `minPasswordLength: 6` and no case requirements.
 */
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

/**
 * Register form values. `confirmPassword` is a client-side UX check only
 * (Better Auth has no such field — strip it before sending) and `photoURL`
 * is optional (Better Auth's `image`); when present it must be https.
 */
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    photoURL: z
      .union([
        z.literal(""),
        z
          .string()
          .trim()
          .url("Enter a valid URL starting with https://")
          .startsWith("https://", "Photo URL must start with https://"),
      ])
      .optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** @typedef {z.infer<typeof registerSchema>} RegisterValues */

/**
 * POST /auth/sign-up/email wire body (API_CONTRACT → Auth): Better Auth
 * accepts `{name, email, password, image?}` — no `confirmPassword`, and the
 * avatar travels as `image`.
 *
 * @param {RegisterValues} values
 * @returns {{ name: string, email: string, password: string, image?: string }}
 */
export function signUpPayload(values) {
  const { name, email, password, photoURL } = values;
  const image =
    typeof photoURL === "string" && photoURL.trim().length > 0
      ? photoURL.trim()
      : undefined;
  return image ? { name, email, password, image } : { name, email, password };
}

/** POST /auth/sign-in/email body. */
export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

/** @typedef {z.infer<typeof signInSchema>} SignInValues */

/**
 * POST /auth/sign-in/social response (API_CONTRACT → Auth): Better Auth
 * returns the provider consent URL — the browser navigates to it for the
 * Google round trip (consent → backend callback → callbackURL).
 */
export const socialSignInResponseSchema = z.object({
  url: z.string().url(),
});

/** @typedef {z.infer<typeof socialSignInResponseSchema>} SocialSignInResponse */
