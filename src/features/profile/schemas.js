import { z } from "zod";

/**
 * PATCH /users/:email body (API_CONTRACT → Users): `{name?, photoURL?}`,
 * at least one required. Same photo rule as registration (SECURITY_AND_AUTH:
 * user-supplied URLs must be https). At least one field must differ from
 * empty — the backend rejects an otherwise-empty patch with 400.
 */
export const profileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),
    photoURL: z
      .string()
      .trim()
      .url("Enter a valid URL starting with https://")
      .startsWith("https://", "Photo URL must start with https://"),
  })
  .refine((data) => data.name !== "" || data.photoURL !== "", {
    message: "Update your name or photo URL",
    path: ["name"],
  });

/** @typedef {z.infer<typeof profileSchema>} ProfileValues */
