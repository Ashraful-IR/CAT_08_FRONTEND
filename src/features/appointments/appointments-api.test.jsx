import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { getMyAppointments } from "./api";
import { useMyAppointments } from "./hooks";
import { server } from "@/mocks/node";
import { myAppointmentFixtures } from "@/mocks/fixtures";

describe("getMyAppointments", () => {
  it("fetches and validates the signed-in user's bookings", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json(myAppointmentFixtures),
      ),
    );

    const appointments = await getMyAppointments();

    expect(appointments).toHaveLength(2);
    expect(appointments[0].doctorName).toBe("Dr. Fatema Begum");
  });

  it("propagates a 401 as an ApiError", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(getMyAppointments()).rejects.toMatchObject({ status: 401 });
  });

  it("throws a descriptive error on malformed bodies", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json([{ nope: true }]),
      ),
    );

    await expect(getMyAppointments()).rejects.toThrow(
      /unexpected appointment data/i,
    );
  });
});

describe("useMyAppointments", () => {
  it("loads the bookings through TanStack Query", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json(myAppointmentFixtures),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useMyAppointments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it("reports the 401 error state instead of throwing", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useMyAppointments(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 401 });
    errorSpy.mockRestore();
  });
});
