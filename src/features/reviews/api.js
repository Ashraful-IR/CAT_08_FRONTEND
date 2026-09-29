import { api } from "@/lib/api/client";
import { parseReview } from "@/lib/api/types";

/**
 * Browser-side reviews data (API_CONTRACT → Reviews).
 */

/**
 * POST /reviews — leave a review against one of the user's past bookings
 * (backend rejects reviews without a matching appointment, or duplicates).
 * The backend recomputes the doctor's rating afterwards.
 *
 * @param {{ doctorId: string, appointmentId: string, rating: number, comment: string }} values
 * @returns {Promise<import("@/lib/api/types").Review>}
 */
export function createReview(values) {
  return api.post("/api/reviews", values).then((data) => parseReview(data));
}
