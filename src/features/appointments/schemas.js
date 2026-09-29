import { z } from "zod";

/**
 * PATCH /appointments/:id body (API_CONTRACT → Appointments): any of
 * patientName, gender, phone, appointmentDate, appointmentTime. Task 4.2's
 * reschedule dialog only edits when + where, so the schema covers those and
 * strips anything else — patient details are handled in 4.4's scope or left
 * as booked.
 */

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a day");

export const rescheduleSchema = z.object({
  appointmentDate: isoDateSchema.refine((value) => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return value >= todayIso;
  }, "Appointment date cannot be in the past"),
  appointmentTime: z
    .string()
    // Bookable grid is 09:00 AM – 04:30 PM (D-003): hours 09–11 AM, 12–04 PM.
    .regex(/^(0[9]|1[0-2]|0[1-4]):[0-5]\d (AM|PM)$/, "Pick a time slot"),
});

/** @typedef {z.infer<typeof rescheduleSchema>} RescheduleValues */
