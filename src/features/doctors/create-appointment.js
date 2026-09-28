import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { appointmentSchema } from "@/lib/api/types";

/**
 * POST /appointments (API_CONTRACT). Runs through the same-origin proxy so
 * the auth cookie flows; the 201 body is validated as an Appointment, and a
 * 409 surfaces as an ApiError the caller maps to a slot-taken message.
 *
 * @param {import("./schemas").BookingValues} values
 * @returns {Promise<import("@/lib/api/types").Appointment>}
 */
export function createAppointment(values) {
  return api.post("/api/appointments", values, { schema: appointmentSchema });
}

/** Mutation wrapper; refreshes the public list that feeds slot greying. */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-appointments"] });
    },
  });
}
