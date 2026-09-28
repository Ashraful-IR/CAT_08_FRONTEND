import { http, HttpResponse } from "msw";
import { doctorFixtures, topRatedFixtures } from "./fixtures";

/**
 * MSW handlers mirroring docs/API_CONTRACT.md — Doctors (public) section only.
 * Auth/appointment/review handlers are added with their roadmap tasks;
 * each must cover success + every documented error status with { message }.
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
];
