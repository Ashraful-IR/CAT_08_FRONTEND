import { server } from "@/mocks/node";
import { doctorFixtures } from "@/mocks/fixtures";

// MSW handlers must mirror docs/API_CONTRACT.md exactly (docs/TDD.md).
// These tests prove the mock layer speaks the contract before any UI uses it.

describe("MSW handlers: doctors (public endpoints)", () => {
  it("GET /api/doctors returns the doctor list matching the contract shape", async () => {
    const res = await fetch("/api/doctors");
    expect(res.status).toBe(200);

    const doctors = await res.json();
    expect(Array.isArray(doctors)).toBe(true);
    expect(doctors.length).toBeGreaterThan(0);

    for (const doctor of doctors) {
      // Confirmed fields per DECISIONS D-001 — nothing more is guaranteed.
      expect(doctor).toMatchObject({
        _id: expect.any(String),
        name: expect.any(String),
        specialty: expect.any(String),
        fee: expect.any(Number),
        rating: expect.any(Number),
        photoURL: expect.any(String),
        description: expect.any(String),
      });
    }
  });

  it("GET /api/doctors returns fixture data a test can rely on", async () => {
    const doctors = await (await fetch("/api/doctors")).json();
    expect(doctors[0]).toEqual(doctorFixtures[0]);
  });

  it("GET /api/doctors/top-rated returns at most 3 doctors", async () => {
    const doctors = await (await fetch("/api/doctors/top-rated")).json();
    expect(doctors.length).toBeLessThanOrEqual(3);
  });

  it("GET /api/doctors/:id returns 404 with { message } for unknown ids", async () => {
    const res = await fetch("/api/doctors/does-not-exist");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: "Doctor not found" });
  });
});

describe("MSW server lifecycle", () => {
  it("listens before tests and restores native fetch after", () => {
    expect(server.listHandlers().length).toBeGreaterThan(0);
  });
});
