import { serverFetch } from "@/lib/api/server";
import { parseDoctor, parseDoctors, parseReviews } from "@/lib/api/types";

/**
 * Server-side doctors data (public endpoints, see API_CONTRACT).
 * Server Components call these directly; the browser uses the /api proxy.
 */

/** GET /doctors — all doctors, validated. */
export function getDoctors() {
  return serverFetch("/api/doctors", { tags: ["doctors"] }).then((data) =>
    parseDoctors(data),
  );
}

/** GET /doctors/top-rated — the backend's top 3 by rating. */
export function getTopRated() {
  return serverFetch("/api/doctors/top-rated", { tags: ["doctors"] }).then((data) =>
    parseDoctors(data),
  );
}

/** GET /doctors/:id — one doctor; 404s surface as ApiError from the client layer. */
export function getDoctor(id) {
  return serverFetch(`/api/doctors/${encodeURIComponent(id)}`, { tags: ["doctors"] }).then(
    (data) => parseDoctor(data),
  );
}

/** GET /reviews/:doctorId — public review list for one doctor. */
export function getReviews(doctorId) {
  return serverFetch(`/api/reviews/${encodeURIComponent(doctorId)}`, {
    tags: ["reviews"],
  }).then((data) => parseReviews(data));
}
