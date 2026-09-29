import { z } from "zod";

/**
 * Review dialog form (POST /reviews body minus the ids the dialog injects
 * from the appointment: doctorId, appointmentId — API_CONTRACT → Reviews).
 */
export const reviewSchema = z.object({
  rating: z
    .number({ message: "Choose a rating" })
    .int()
    .min(1, "Choose a rating")
    .max(5),
  comment: z
    .string()
    .trim()
    .min(1, "Share a few words about your visit")
    .max(1000, "Keep your review under 1000 characters"),
});

/** @typedef {z.infer<typeof reviewSchema>} ReviewValues */
