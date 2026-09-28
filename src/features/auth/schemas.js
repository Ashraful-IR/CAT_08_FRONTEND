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
