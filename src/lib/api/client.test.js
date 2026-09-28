import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { z } from "zod";
import { api, setUnauthorizedHandler, messageFrom } from "./client";
import { ApiError } from "./errors";
import { server } from "@/mocks/node";
import { doctorSchema } from "./types";
import { doctorFixtures } from "@/mocks/fixtures";

describe("api client (browser)", () => {
  it("GET parses JSON and validates through a Zod schema", async () => {
    const doctors = await api.get("/api/doctors", z.array(doctorSchema));
    expect(doctors).toEqual(doctorFixtures);
  });

  it("GET without a schema returns the raw body", async () => {
    const data = await api.get("/api/doctors");
    expect(data[0].name).toBe(doctorFixtures[0].name);
  });

  it("throws ApiError with the backend message on 404", async () => {
    await expect(api.get("/api/doctors/nope")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Doctor not found",
    });
  });

  it("invokes the registered 401 handler instead of throwing", async () => {
    server.use(
      http.get("/api/secure", () =>
        HttpResponse.json({ message: "Session expired" }, { status: 401 }),
      ),
    );

    let unauthorized = false;
    setUnauthorizedHandler(() => {
      unauthorized = true;
    });

    await expect(api.get("/api/secure")).rejects.toBeInstanceOf(ApiError);
    expect(unauthorized).toBe(true);
  });

  it("does not invoke the 401 hook when skip401Hook is set (sign-in path)", async () => {
    server.use(
      http.post("/api/auth/sign-in/email", () =>
        HttpResponse.json({ message: "Invalid email or password" }, { status: 401 }),
      ),
    );

    let unauthorized = false;
    setUnauthorizedHandler(() => {
      unauthorized = true;
    });

    await expect(
      api.post("/api/auth/sign-in/email", { email: "a@b.c", password: "x" }, { skip401Hook: true }),
    ).rejects.toMatchObject({ status: 401, message: "Invalid email or password" });
    expect(unauthorized).toBe(false);
  });

  it("surfaces the 409 slot-conflict message", async () => {
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    await expect(api.post("/api/appointments", {})).rejects.toMatchObject({
      status: 409,
      message: "Doctor is already booked at this slot",
    });
  });

  it("handles 204 No Content without parsing a body", async () => {
    server.use(http.delete("/api/anything", () => new HttpResponse(null, { status: 204 })));
    await expect(api.delete("/api/anything")).resolves.toBeNull();
  });

  it("PATCH sends a JSON body and validates the response through a schema", async () => {
    server.use(
      http.patch("/api/appointments/a1", async ({ request }) => {
        const body = await request.json();
        expect(body).toEqual({ appointmentTime: "03:00 PM" });
        return HttpResponse.json({ message: "Appointment updated" });
      }),
    );

    const schema = z.object({ message: z.string() });
    await expect(
      api.patch("/api/appointments/a1", { appointmentTime: "03:00 PM" }, { schema }),
    ).resolves.toEqual({ message: "Appointment updated" });
  });

  it("DELETE parses the response body through a schema when given", async () => {
    server.use(
      http.delete("/api/appointments/a1", () =>
        HttpResponse.json({ message: "Appointment cancelled" }),
      ),
    );

    const schema = z.object({ message: z.string() });
    await expect(api.delete("/api/appointments/a1", { schema })).resolves.toEqual({
      message: "Appointment cancelled",
    });
  });

  it("POST with an empty success body resolves to { status }", async () => {
    server.use(http.post("/api/empty", () => new HttpResponse(null, { status: 201 })));
    await expect(api.post("/api/empty", {})).resolves.toEqual({ status: 201 });
  });

  it("surfaces a generic message when an error body is not JSON (e.g. HTML)", async () => {
    server.use(
      http.get("/api/html-error", () =>
        new HttpResponse("<html>Bad Gateway</html>", {
          status: 502,
          headers: { "Content-Type": "text/html" },
        }),
      ),
    );

    await expect(api.get("/api/html-error")).rejects.toMatchObject({
      status: 502,
      message: "Unexpected server response",
    });
  });

  it("maps network failures to a friendly ApiError", async () => {
    server.use(
      http.get("/api/offline", () => HttpResponse.error()),
    );
    await expect(api.get("/api/offline")).rejects.toMatchObject({
      status: 0,
      message: "Cannot reach the server. Check your connection and try again.",
    });
  });

  it("messageFrom prefers the backend message and falls back cleanly", () => {
    expect(messageFrom({ message: "Email already registered" }, "fallback")).toBe(
      "Email already registered",
    );
    expect(messageFrom(null, "fallback")).toBe("fallback");
  });
});
