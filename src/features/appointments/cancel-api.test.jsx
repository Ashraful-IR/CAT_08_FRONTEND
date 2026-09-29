import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { myAppointmentFixtures } from "@/mocks/fixtures";
import { cancelAppointment } from "./api";
import { appointmentKeys, useCancelAppointment } from "./hooks";

const appointment = myAppointmentFixtures[0];

describe("cancelAppointment", () => {
  it("DELETEs the appointment and returns the message", async () => {
    let calledMethod = "";
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () => {
        calledMethod = "DELETE";
        return HttpResponse.json({ message: "Appointment cancelled" });
      }),
    );

    const result = await cancelAppointment(appointment._id);

    expect(calledMethod).toBe("DELETE");
    expect(result.message).toBe("Appointment cancelled");
  });

  it("propagates 403 (not owner) and 404", async () => {
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json({ message: "Not allowed" }, { status: 403 }),
      ),
      http.delete(`/api/appointments/other-id`, () =>
        HttpResponse.json({ message: "Not found" }, { status: 404 }),
      ),
    );

    await expect(cancelAppointment(appointment._id)).rejects.toMatchObject({
      status: 403,
    });
    await expect(cancelAppointment("other-id")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("useCancelAppointment", () => {
  it("removes the appointment from the cache on success", async () => {
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json({ message: "Appointment cancelled" }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(appointmentKeys.mine, myAppointmentFixtures);
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCancelAppointment(), { wrapper });
    await act(async () => {
      result.current.mutate(appointment._id);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const cached = queryClient.getQueryData(appointmentKeys.mine);
    expect(cached).toHaveLength(1);
    expect(cached[0]._id).not.toBe(appointment._id);
  });

  it("frees the vacated slot in the public list", async () => {
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json({ message: "Appointment cancelled" }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCancelAppointment(), { wrapper });
    await act(async () => {
      result.current.mutate(appointment._id);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["public-appointments"],
    });
  });
});
