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
import { CancelDialog } from "./CancelDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const appointment = myAppointmentFixtures[0];

beforeAll(() => {
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

function renderDialog() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>
        <CancelDialog
          appointment={appointment}
          trigger={
            <DialogTrigger asChild>
              <button type="button">Cancel appointment</button>
            </DialogTrigger>
          }
        />
      </Providers>
    </QueryClientProvider>,
  );
}

async function renderAndOpen() {
  const user = userEvent.setup();
  const result = renderDialog();
  await user.click(screen.getByRole("button", { name: /cancel appointment/i }));
  const dialog = await screen.findByRole("dialog", {
    name: /cancel this appointment/i,
  });
  return { user, dialog, ...result };
}

describe("CancelDialog", () => {
  it("warns that cancelling permanently deletes the booking", async () => {
    await renderAndOpen();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/permanently deletes/i),
    ).toBeInTheDocument();
  });

  it("shows the doctor and slot being cancelled", async () => {
    await renderAndOpen();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText(/Dr\. Fatema Begum/),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/2026-09-30 · 10:00 AM/),
    ).toBeInTheDocument();
  });

  it("calls DELETE only after the destructive confirm", async () => {
    let deleteCount = 0;
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () => {
        deleteCount += 1;
        return HttpResponse.json({ message: "Appointment cancelled" });
      }),
    );

    const { user, dialog } = await renderAndOpen();
    expect(deleteCount).toBe(0); // nothing before confirming

    await user.click(
      within(dialog).getByRole("button", { name: /yes, cancel/i }),
    );

    await waitFor(() => expect(deleteCount).toBe(1));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("keeps the booking when the user backs out", async () => {
    let deleteCount = 0;
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () => {
        deleteCount += 1;
        return HttpResponse.json({ message: "Appointment cancelled" });
      }),
    );

    const { user, dialog } = await renderAndOpen();
    await user.click(
      within(dialog).getByRole("button", { name: /keep appointment/i }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(deleteCount).toBe(0);
  });

  it("shows the backend error inline when deletion fails", async () => {
    server.use(
      http.delete(`/api/appointments/${appointment._id}`, () =>
        HttpResponse.json({ message: "Not allowed" }, { status: 403 }),
      ),
    );

    const { user, dialog } = await renderAndOpen();
    await user.click(
      within(dialog).getByRole("button", { name: /yes, cancel/i }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      /not allowed/i,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = await renderAndOpen();

    expect(await axe(container)).toHaveNoViolations();
  });
});
