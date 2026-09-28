import { http, HttpResponse } from "msw";
import { doctorFixtures, topRatedFixtures } from "./fixtures";

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

  // Session: default signed-out so page tests are deterministic.
  // Sign-in flows override with 200 { user } via server.use(...).
  http.get("/api/auth/session", () =>
    HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
  ),
];
