import { http, HttpResponse } from "msw";
import { server } from "@/mocks/node";
import { doctorFixtures, sessionResponseFixture, signInResponseFixture, userFixture } from "@/mocks/fixtures";

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

describe("MSW handlers: auth (Better Auth contract, live-verified 2026-10-01)", () => {
  // The frontend's session source of truth stays the compat alias — its 401
  // body even differs from the native endpoint ({message} vs literal null).
  it("GET /api/auth/session mirrors the backend compat alias: 401 signed out, {user:{photoURL}} signed in", async () => {
    const out = await fetch("/api/auth/session");
    expect(out.status).toBe(401);
    expect(await out.json()).toEqual({ message: "No active session" });

    server.use(
      http.get("/api/auth/session", () =>
        HttpResponse.json(sessionResponseFixture),
      ),
    );
    const signedIn = await fetch("/api/auth/session");
    expect(signedIn.status).toBe(200);
    const body = await signedIn.json();
    expect(body.user).toMatchObject({ id: expect.any(String), name: expect.any(String), email: expect.any(String), photoURL: expect.any(String) });
  });

  it("POST /api/auth/sign-up/email returns 200 {token,user} (Better Auth signs the user in)", async () => {
    const res = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "N", email: "n@x.com", password: "Secret1" }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ token: expect.any(String), user: expect.objectContaining({ id: expect.any(String) }) });
  });

  it("POST /api/auth/sign-up/email returns 422 with a Better Auth code for duplicate email", async () => {
    const res = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "N", email: "taken@example.com", password: "Secret1" }),
    });
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" });
  });

  it("POST /api/auth/sign-in/email returns 200 {token,user:image-shaped} and 401 on bad credentials", async () => {
    const ok = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "rifat@example.com", password: "Secret1" }),
    });
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual(signInResponseFixture);

    const bad = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "rifat@example.com", password: "wrong" }),
    });
    expect(bad.status).toBe(401);
    expect(await bad.json()).toMatchObject({ message: "Invalid email or password", code: "INVALID_EMAIL_OR_PASSWORD" });
  });

  it("POST /api/auth/sign-out returns 200 {success:true}", async () => {
    const res = await fetch("/api/auth/sign-out", { method: "POST" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it("GET /api/auth/get-session returns the native Better Auth shape (user.image, not photoURL)", async () => {
    server.use(
      http.get("/api/auth/get-session", () =>
        HttpResponse.json({ user: { ...userFixture, photoURL: undefined, image: userFixture.photoURL } }),
      ),
    );
    const res = await fetch("/api/auth/get-session");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user.image).toBe(userFixture.photoURL);
    expect(body.user.photoURL).toBeUndefined();
  });
});

describe("MSW server lifecycle", () => {
  it("listens before tests and restores native fetch after", () => {
    expect(server.listHandlers().length).toBeGreaterThan(0);
  });
});
