import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { doctorFixtures, topRatedFixtures } from "@/mocks/fixtures";
import { getDoctor, getDoctors, getTopRated } from "./api";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";

describe("doctors api (server components)", () => {
  it("getDoctors returns the validated doctor list", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
    );

    await expect(getDoctors()).resolves.toEqual(doctorFixtures);
  });

  it("getTopRated returns the backend's top-rated slice", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors/top-rated`, () =>
        HttpResponse.json(topRatedFixtures),
      ),
    );

    await expect(getTopRated()).resolves.toEqual(topRatedFixtures);
  });

  it("getDoctor returns a single doctor by id", async () => {
    const [doctor] = doctorFixtures;
    server.use(http.get(`${BACKEND}/api/doctors/${doctor._id}`, () => HttpResponse.json(doctor)));

    await expect(getDoctor(doctor._id)).resolves.toEqual(doctor);
  });

  it("getDoctor surfaces the backend 404 message for an unknown id", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors/unknown-id`, () =>
        HttpResponse.json({ message: "Doctor not found" }, { status: 404 }),
      ),
    );

    await expect(getDoctor("unknown-id")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Doctor not found",
    });
  });

  it("throws a 502 ApiError when a doctor payload does not match the contract", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () =>
        HttpResponse.json([{ _id: "x", name: "Dr. Who" }]),
      ),
    );

    await expect(getDoctors()).rejects.toMatchObject({
      name: "ApiError",
      status: 502,
    });
  });
});
