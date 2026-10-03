import { http, HttpResponse } from "msw";
import {
  doctorFixtures,
  myAppointmentFixtures,
  publicAppointmentFixtures,
  reviewFixtures,
  signInResponseFixture,
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

  // Session: default signed-out so page tests are deterministic. Mirrors the
  // backend's compat alias (live-verified): 401 {message:"No active session"}.
  // Sign-in flows override with 200 { user } via server.use(...).
  http.get("/api/auth/session", () =>
    HttpResponse.json({ message: "No active session" }, { status: 401 }),
  ),

  // Better Auth (live-verified 2026-10-01): sign-up signs the user in (200
  // {token,user}); a duplicate email is 422 with a Better Auth code.
  http.post("/api/auth/sign-up/email", async ({ request }) => {
    const { email } = await request.json();
    if (email === "taken@example.com") {
      return HttpResponse.json(
        { message: "User already exists. Use another email.", code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
        { status: 422 },
      );
    }
    return HttpResponse.json(
      {
        token: "mock.better-auth.token",
        user: { id: "u-new", name: "New User", email: "new@example.com", image: null },
      },
      { status: 200 },
    );
  }),

  // Sign-in mirrors the live backend: 200 {token,user} on success, 401
  // {message,code} on bad credentials.
  http.post("/api/auth/sign-in/email", async ({ request }) => {
    const { password } = await request.json();
    if (password === "wrong") {
      return HttpResponse.json(
        { message: "Invalid email or password", code: "INVALID_EMAIL_OR_PASSWORD" },
        { status: 401 },
      );
    }
    return HttpResponse.json(signInResponseFixture);
  }),

  http.post("/api/auth/sign-out", () => HttpResponse.json({ success: true })),

  // Social sign-in (Better Auth): 200 {url} — the browser is sent to the
  // provider consent URL for the OAuth round trip. Tests override for the
  // documented error cases (403 INVALID_ORIGIN, 500 provider not configured).
  http.post("/api/auth/sign-in/social", () =>
    HttpResponse.json({
      url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=mock&state=mock",
    }),
  ),
];
