import { api } from "@/lib/api/client";
import { parseAppointment, parseAppointments } from "@/lib/api/types";

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

/**
 * PATCH /appointments/:id — reschedule to a new date+time (owner only).
 * Returns the full updated Appointment; a taken slot arrives as 409.
 *
 * @param {string} id
 * @param {import("./schemas").RescheduleValues} values
 * @returns {Promise<import("@/lib/api/types").Appointment>}
 */
export function rescheduleAppointment(id, values) {
  return api
    .patch(`/api/appointments/${encodeURIComponent(id)}`, values, {
      schema: undefined,
    })
    .then((data) => parseAppointment(data));
}
