import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyAppointments, rescheduleAppointment } from "./api";

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
