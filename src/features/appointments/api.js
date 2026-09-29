import { api } from "@/lib/api/client";
import { parseAppointments } from "@/lib/api/types";

/**
 * Browser-side appointments data (ARCHITECTURE → Data fetching: "my
 * appointments" is auth'd, so it lives in the client where the httpOnly
 * cookie flows through the same-origin proxy).
 */

/** GET /appointments/mine — the signed-in user's bookings, validated. */
export function getMyAppointments() {
  return api.get("/api/appointments/mine", undefined, {
    // A 401 here means the session expired — the global handler must run.
    skip401Hook: false,
  }).then((data) => parseAppointments(data));
}
