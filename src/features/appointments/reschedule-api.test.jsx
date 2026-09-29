import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { myAppointmentFixtures } from "@/mocks/fixtures";
import { rescheduleAppointment } from "./api";
import { appointmentKeys, useRescheduleAppointment } from "./hooks";

const appointment = myAppointmentFixtures[0];

describe("rescheduleAppointment", () => {
  it("PATCHes only the date and time", async () => {
    let receivedBody = null;
    server.use(
      http.patch(`/api/appointments/${appointment._id}`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({
          ...appointment,
          ...receivedBody,
          updatedAt: "2026-09-28T12:00:00.000Z",
        });
      }),
    );

    await rescheduleAppointment(appointment._id, {
      appointmentDate: "2026-10-01",
      appointmentTime: "03:30 PM",
    });

    expect(receivedBody).toEqual({
      appointmentDate: "2026-10-01",
      appointmentTime: "03:30 PM",
    });
  });

  it("propagates a 409 slot conflict", async () => {
    server.use(
      http.patch(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    await expect(
      rescheduleAppointment(appointment._id, {
        appointmentDate: "2026-10-01",
        appointmentTime: "03:30 PM",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe("useRescheduleAppointment", () => {
  it("writes the updated appointment into the cache on success", async () => {
    server.use(
      http.patch(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json({
          ...appointment,
          appointmentDate: "2026-10-01",
          appointmentTime: "03:30 PM",
        }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(appointmentKeys.mine, myAppointmentFixtures);
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useRescheduleAppointment(), { wrapper });
    await act(async () => {
      result.current.mutate({
        id: appointment._id,
        appointmentDate: "2026-10-01",
        appointmentTime: "03:30 PM",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData(appointmentKeys.mine);
    expect(cached[0].appointmentDate).toBe("2026-10-01");
    expect(cached[0].appointmentTime).toBe("03:30 PM");
  });

  it("surfaces the 409 message without closing the dialog", async () => {
    server.use(
      http.patch(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useRescheduleAppointment(), { wrapper });
    await act(async () => {
      result.current.mutate({
        id: appointment._id,
        appointmentDate: "2026-10-01",
        appointmentTime: "03:30 PM",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error.message).toBe(
      "Doctor is already booked at this slot",
    );
  });
});
