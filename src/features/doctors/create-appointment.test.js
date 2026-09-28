import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { createElement } from "react";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { createAppointment, useCreateAppointment } from "./create-appointment";

const BACKEND = undefined; // browser client uses the relative /api proxy path

const booking = {
  doctorId: "6a51ea90108e8a8b1caaf768",
  patientName: "Rifat Hossain",
  gender: "Male",
  phone: "01712345678",
  appointmentDate: "2026-09-30",
  appointmentTime: "10:00 AM",
};

const created = {
  ...booking,
  _id: "6a51ea90108e8a8b1cab3001",
  id: "6a51ea90108e8a8b1cab3001",
  userEmail: "rifat@example.com",
  doctorName: "Dr. Fatema Begum",
  fee: 1300,
  rating: 4.9,
  createdAt: "2026-09-28T15:00:00.000Z",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function QueryWrapper({ children }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return QueryWrapper;
}

describe("createAppointment", () => {
  it("POSTs the booking and returns the created appointment", async () => {
    server.use(
      http.post("/api/appointments", () => HttpResponse.json(created, { status: 201 })),
    );

    await expect(createAppointment(booking)).resolves.toMatchObject({
      _id: created._id,
    });
  });

  it("throws the backend's 409 message as an ApiError", async () => {
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    await expect(createAppointment(booking)).rejects.toMatchObject({
      name: "ApiError",
      status: 409,
      message: "Doctor is already booked at this slot",
    });
  });
});

describe("useCreateAppointment", () => {
  it("exposes isPending while the POST is in flight", async () => {
    server.use(
      http.post("/api/appointments", async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(created, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useCreateAppointment(), {
      wrapper: createWrapper(),
    });
    result.current.mutate(booking);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
