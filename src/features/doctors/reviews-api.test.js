import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { reviewFixtures } from "@/mocks/fixtures";
import { getReviews } from "./api";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";
const doctorId = reviewFixtures[0].doctorId;

describe("reviews api (server components)", () => {
  it("getReviews returns the validated review list for a doctor", async () => {
    server.use(
      http.get(`${BACKEND}/api/reviews/${doctorId}`, () =>
        HttpResponse.json(reviewFixtures),
      ),
    );

    await expect(getReviews(doctorId)).resolves.toEqual(reviewFixtures);
  });

  it("resolves to an empty list for doctors without reviews", async () => {
    server.use(
      http.get(`${BACKEND}/api/reviews/none`, () => HttpResponse.json([])),
    );

    await expect(getReviews("none")).resolves.toEqual([]);
  });

  it("throws a 502 ApiError when a review payload does not match the contract", async () => {
    server.use(
      http.get(`${BACKEND}/api/reviews/${doctorId}`, () =>
        HttpResponse.json([{ _id: "x", rating: 9 }]),
      ),
    );

    await expect(getReviews(doctorId)).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
    });
  });
});
