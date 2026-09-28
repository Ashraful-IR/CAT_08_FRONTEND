import { z } from "zod";

/**
 * Booking form body for POST /appointments (API_CONTRACT): doctorId,
 * patientName, gender, phone, appointmentDate, appointmentTime — all
 * required. doctorId/appointmentDate/appointmentTime are added from the
 * picked slot, so they are validated but not asked from the user.
 */

/** YYYY-MM-DD in the viewer-agnostic local sense; the slot picker only
 * produces today-or-later dates, and the schema double-checks the shape. */
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to choose a day");

export const bookingSchema = z.object({
  doctorId: z.string().min(1),
  patientName: z
    .string()
    .trim()
    .min(1, "Patient name is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Select a gender",
  }),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s()-]/g, ""))
    .refine((value) => /^\+?\d{6,15}$/.test(value), {
      message: "Enter a valid phone number (6–15 digits)",
    }),
  appointmentDate: isoDateSchema.refine(
    (value) => {
      const today = new Date();
      const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      return value >= todayIso;
    },
    { message: "Appointment date cannot be in the past" },
  ),
  appointmentTime: z
    .string()
    .regex(/^\d{2}:\d{2} (AM|PM)$/, "Pick a time slot"),
});

/** @typedef {z.infer<typeof bookingSchema>} BookingValues */
