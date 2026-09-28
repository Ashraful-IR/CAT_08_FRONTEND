import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { z } from "zod";
import { serverFetch } from "./server";
import { ApiError } from "./errors";
import { doctorSchema } from "./types";
import { server } from "@/mocks/node";
import { doctorFixtures } from "@/mocks/fixtures";

// request() prepends BACKEND_URL on the server; MSW intercepts absolute URLs too.
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";

describe("serverFetch (Server Components)", () => {
  it("fetches from BACKEND_URL and validates through the schema", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
    );

    const doctors = await serverFetch("/api/doctors", { schema: z.array(doctorSchema) });
    expect(doctors).toEqual(doctorFixtures);
  });

  it("passes revalidate/tags to Next's fetch cache options", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    server.use(
      http.get(`${BACKEND}/api/doctors/top-rated`, () =>
        HttpResponse.json(doctorFixtures.slice(0, 3)),
      ),
    );

    await serverFetch("/api/doctors/top-rated", { revalidate: 30, tags: ["doctors"] });

    const [, init] = fetchSpy.mock.calls.at(-1);
    expect(init.next).toEqual({ revalidate: 30, tags: ["doctors"] });
    fetchSpy.mockRestore();
  });

  it("returns raw text when a success response has a non-JSON body", async () => {
    server.use(
      http.get(`${BACKEND}/api/ping`, () =>
        new HttpResponse("pong", { headers: { "Content-Type": "text/plain" } }),
      ),
    );

    await expect(serverFetch("/api/ping")).resolves.toBe("pong");
  });

  it("throws ApiError carrying the backend message on error statuses", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors/bad`, () =>
        HttpResponse.json({ message: "Invalid Doctor ID format" }, { status: 400 }),
      ),
    );

    await expect(serverFetch("/api/doctors/bad")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Invalid Doctor ID format",
    });
  });
});
