import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelAppointment,
  getMyAppointments,
  rescheduleAppointment,
} from "./api";
import { splitAppointments } from "./split";
import { toIsoDate } from "@/lib/datetime";

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

/**
 * Live count for the navbar's Appointments badge (design:
 * docappoint_home_doctor_discovery → nav count). Reads the shared
 * ['appointments','mine'] cache — appointments pages written straight into
 * that cache (reschedule/cancel/book) update the badge for free.
 *
 * Fetches only while signed in; the 401-hook is skipped so a signed-out
 * visitor (or an expiring session) never gets bounced to /login by the badge.
 *
 * @param {boolean} enabled - the session is signed in
 * @returns {number | null} upcoming count, or null when not signed in
 */
export function useUpcomingAppointmentCount(enabled) {
  const query = useQuery({
    queryKey: appointmentKeys.mine,
    queryFn: getMyAppointments,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (!enabled || !query.data) {
    return null;
  }
  const now = new Date();
  const { upcoming } = splitAppointments(query.data, {
    date: toIsoDate(now),
    minutes: now.getHours() * 60 + now.getMinutes(),
  });
  return upcoming.length;
}

/**
 * PATCH /appointments/:id (task 4.2). Writes the returned Appointment back
 * into the ['appointments','mine'] cache so the card re-renders in place;
 * a 409 (slot taken) surfaces to the dialog as mutation.error.
 */
export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...values }) => rescheduleAppointment(id, values),
    onSuccess: (updated) => {
      queryClient.setQueryData(appointmentKeys.mine, (current) =>
        (current ?? []).map((appointment) =>
          appointment._id === updated._id ? updated : appointment,
        ),
      );
      // The slot the visit vacated frees up for other visitors.
      queryClient.invalidateQueries({ queryKey: ["public-appointments"] });
    },
  });
}

/**
 * DELETE /appointments/:id (task 4.3). Removes the booking from the
 * ['appointments','mine'] cache so the card disappears without a refetch;
 * also refreshes the public list (the slot becomes bookable again).
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: (_result, cancelledId) => {
      queryClient.setQueryData(appointmentKeys.mine, (current) =>
        (current ?? []).filter((appointment) => appointment._id !== cancelledId),
      );
      queryClient.invalidateQueries({ queryKey: ["public-appointments"] });
    },
  });
}
