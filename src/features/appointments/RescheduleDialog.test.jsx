import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { myAppointmentFixtures } from "@/mocks/fixtures";
import { Providers } from "@/app/providers";
import { DialogTrigger } from "@/components/ui/dialog";
import { RescheduleDialog } from "./RescheduleDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const appointment = myAppointmentFixtures[0]; // 2026-09-30 10:00 AM

beforeAll(() => {
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>
        <RescheduleDialog
          appointment={appointment}
          doctorsById={{}}
          trigger={
            <DialogTrigger asChild>
              <button type="button">Reschedule</button>
            </DialogTrigger>
          }
        />
      </Providers>
    </QueryClientProvider>,
  );
}

/** Renders + opens the dialog, returning the pieces tests need. */
async function renderAndOpen() {
  const user = userEvent.setup();
  const result = renderDialog();
  await user.click(screen.getByRole("button", { name: "Reschedule" }));
  const dialog = await screen.findByRole("dialog", { name: /reschedule/i });
  return { user, dialog, ...result };
}

describe("RescheduleDialog", () => {
  it("opens from the trigger and explains the current slot", async () => {
    await renderAndOpen();

    expect(
      within(screen.getByRole("dialog")).getByText(
        /currently 2026-09-30 · 10:00 AM/i,
      ),
    ).toBeInTheDocument();
  });

  it("preselects the current slot", async () => {
    await renderAndOpen();

    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(
        within(dialog).getByRole("radio", { name: "10:00 AM" }),
      ).toBeChecked();
    });
  });

  it("submits a new slot and closes on success", async () => {
    server.use(
      http.patch(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json({
          ...appointment,
          appointmentDate: "2026-10-01",
          appointmentTime: "11:30 AM",
        }),
      ),
    );

    const { user, dialog } = await renderAndOpen();

    await user.click(await within(dialog).findByRole("tab", { name: /oct 1/i }));
    await user.click(within(dialog).getByRole("radio", { name: "11:30 AM" }));
    await user.click(
      within(dialog).getByRole("button", { name: /save new time/i }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("shows the backend 409 message inline and keeps the dialog open", async () => {
    server.use(
      http.patch(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    const { user, dialog } = await renderAndOpen();

    await user.click(await within(dialog).findByRole("tab", { name: /oct 1/i }));
    await user.click(within(dialog).getByRole("radio", { name: "11:30 AM" }));
    await user.click(
      within(dialog).getByRole("button", { name: /save new time/i }),
    );

    expect(
      await within(dialog).findByRole("alert"),
    ).toHaveTextContent(/doctor is already booked at this slot/i);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("disables save until the slot changes", async () => {
    await renderAndOpen();

    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(
        within(dialog).getByRole("radio", { name: "10:00 AM" }),
      ).toBeChecked();
    });
    expect(
      within(dialog).getByRole("button", { name: /save new time/i }),
    ).toBeDisabled();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = await renderAndOpen();

    expect(await axe(container)).toHaveNoViolations();
  });
});
