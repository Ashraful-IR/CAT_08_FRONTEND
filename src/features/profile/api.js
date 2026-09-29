import { api } from "@/lib/api/client";
import { parseUser } from "@/lib/api/types";

/**
 * Browser-side profile data (API_CONTRACT → Users).
 */

/**
 * PATCH /users/:email — update the signed-in user's name and/or photoURL.
 * `:email` must be URL-encoded and equal the signed-in user's email
 * (DECISIONS B-006). At least one field is required (documented 400
 * otherwise). Resolves to the backend's `{ message, user }`.
 *
 * @param {string} email
 * @param {{ name?: string, photoURL?: string }} values
 * @returns {Promise<{ message: string, user: import("@/lib/api/types").User }>}
 */
export function updateProfile(email, values) {
  return api.patch(
    `/api/users/${encodeURIComponent(email)}`,
    values,
  ).then((data) => ({
    message: data?.message ?? "Profile updated",
    user: parseUser(data?.user),
  }));
}
