import { z } from "zod";
import { ApiError } from "./errors";

/**
 * JSDoc typedefs + Zod schemas mirroring docs/API_CONTRACT.md.
 * In JS, these Zod schemas are the runtime safety net: every API response
 * is parsed with them before use (CODING_STANDARDS → JavaScript).
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} photoURL
 */

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  photoURL: z.string(),
});

/**
 * Confirmed against the deployed backend (DECISIONS D-001).
 * @typedef {Object} Doctor
 * @property {string} _id
 * @property {string} name
 * @property {string} specialty
 * @property {number} fee
 * @property {number} rating
 * @property {string} photoURL
 * @property {string} description
 */

export const doctorSchema = z.object({
  _id: z.string(),
  name: z.string(),
  specialty: z.string(),
  fee: z.number(),
  rating: z.number(),
  photoURL: z.string(),
  description: z.string(),
});

/**
 * @typedef {z.infer<typeof doctorSchema>} DoctorZod
 */

/**
 * @typedef {Object} Appointment
 * @property {string} _id
 * @property {string} [id] - only present on the create response
 * @property {string} userEmail
 * @property {string} doctorId
 * @property {string} doctorName
 * @property {number} fee - copied from the doctor at booking time
 * @property {number} rating - copied from the doctor at booking time
 * @property {string} patientName
 * @property {string} gender
 * @property {string} phone
 * @property {string} appointmentDate - YYYY-MM-DD
 * @property {string} appointmentTime - hh:mm AM/PM
 * @property {string} createdAt
 * @property {string} [updatedAt]
 */

export const appointmentSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  userEmail: z.string(),
  doctorId: z.string(),
  doctorName: z.string(),
  fee: z.number(),
  rating: z.number(),
  patientName: z.string(),
  gender: z.string(),
  phone: z.string(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

/**
 * @typedef {Object} Review
 * @property {string} _id
 * @property {string} [id]
 * @property {string} doctorId
 * @property {string} appointmentId
 * @property {number} rating
 * @property {string} comment
 * @property {string} userEmail
 * @property {string} userName
 * @property {string} userPhotoURL
 * @property {string} createdAt
 */

export const reviewSchema = z.object({
  _id: z.string(),
  id: z.string().optional(),
  doctorId: z.string(),
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  userEmail: z.string(),
  userName: z.string(),
  userPhotoURL: z.string(),
  createdAt: z.string(),
});

/** Parses an unknown value as a Doctor[], throwing a descriptive ApiError on failure. */
export function parseDoctors(data) {
  return parseWith(z.array(doctorSchema), data, "Unexpected doctor data");
}

/** Parses an unknown value as a Doctor. */
export function parseDoctor(data) {
  return parseWith(doctorSchema, data, "Unexpected doctor data");
}

/** Parses an unknown value as an Appointment[]. */
export function parseAppointments(data) {
  return parseWith(z.array(appointmentSchema), data, "Unexpected appointment data");
}

/** Parses an unknown value as an Appointment. */
export function parseAppointment(data) {
  return parseWith(appointmentSchema, data, "Unexpected appointment data");
}

/** Parses an unknown value as a Review[]. */
export function parseReviews(data) {
  return parseWith(z.array(reviewSchema), data, "Unexpected review data");
}

/** Parses an unknown value as a User (session/sign-in responses). */
export function parseUser(data) {
  return parseWith(userSchema, data, "Unexpected user data");
}

function parseWith(schema, data, fallbackMessage) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(502, fallbackMessage);
  }
  return result.data;
}
