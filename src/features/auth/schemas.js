import { z } from "zod";

/**
 * Session user per API_CONTRACT (id, name, email, photoURL). The backend may
 * attach extra fields; the schema validates the documented subset and passes
 * the rest through so callers never crash on extension data.
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

/** Backend password rule, mirrored from API_CONTRACT → Auth. */
export const passwordSchema = z
  .string()
  .regex(/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/,
    "Password must be at least 6 characters with one uppercase and one lowercase letter");

/** POST /auth/sign-up/email body — all fields required, including photoURL. */
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    photoURL: z.string().trim().url("Enter a valid URL starting with https://").startsWith("https://", "Photo URL must start with https://"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** @typedef {z.infer<typeof registerSchema>} RegisterValues */

/** POST /auth/sign-in/email body. */
export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

/** @typedef {z.infer<typeof signInSchema>} SignInValues */
