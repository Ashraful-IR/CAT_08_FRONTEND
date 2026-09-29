import { useQuery } from "@tanstack/react-query";
import { getMyAppointments } from "./api";

/** Centralised query keys for the appointments feature (ARCHITECTURE). */
export const appointmentKeys = {
  mine: ["appointments", "mine"],
};

/**
 * The signed-in user's bookings (GET /appointments/mine). No retry: a 401
 * surfaces fast and the global handler redirects to login.
 *
 * @returns {import("@tanstack/react-query").UseQueryResult<
 *   Array<import("@/lib/api/types").Appointment>>}
 */
export function useMyAppointments() {
  return useQuery({
    queryKey: appointmentKeys.mine,
    queryFn: getMyAppointments,
    retry: false,
  });
}
