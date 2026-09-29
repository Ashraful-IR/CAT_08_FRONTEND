import { http, HttpResponse } from "msw";
import {
  doctorFixtures,
  myAppointmentFixtures,
  publicAppointmentFixtures,
  reviewFixtures,
  topRatedFixtures,
} from "./fixtures";

/**
 * MSW handlers mirroring docs/API_CONTRACT.md.
 * Doctors (public) + Auth/session sections. Each handler covers success +
 * documented error statuses with { message }. Tests override per-case with
 * server.use(...).
 */

export const handlers = [
  http.get("/api/doctors", () => HttpResponse.json(doctorFixtures)),

  // Backend returns the top 3 by rating.
  http.get("/api/doctors/top-rated", () => HttpResponse.json(topRatedFixtures)),

  http.get("/api/doctors/:id", ({ params }) => {
    const doctor = doctorFixtures.find((d) => d._id === params.id);
    if (!doctor) {
      return HttpResponse.json({ message: "Doctor not found" }, { status: 404 });
    }
    return HttpResponse.json(doctor);
  }),

  // Reviews are public per doctor; empty list for doctors without reviews.
  http.get("/api/reviews/:doctorId", ({ params }) => {
    const reviews = reviewFixtures.filter((r) => r.doctorId === params.doctorId);
    return HttpResponse.json(reviews);
  }),

  // Public appointment list (B-001) — used only to grey out booked slots.
  http.get("/api/appointments", () => HttpResponse.json(publicAppointmentFixtures)),

  // The signed-in user's own bookings; default session handler is 401, so
  // tests that need this override /api/auth/session with 200 { user }.
  http.get("/api/appointments/mine", () =>
    HttpResponse.json(myAppointmentFixtures),
  ),

  // Session: default signed-out so page tests are deterministic.
  // Sign-in flows override with 200 { user } via server.use(...).
  http.get("/api/auth/session", () =>
    HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
  ),
];
