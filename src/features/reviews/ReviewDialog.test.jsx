import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { myAppointmentFixtures, reviewFixtures } from "@/mocks/fixtures";
import { Providers } from "@/app/providers";
import { DialogTrigger } from "@/components/ui/dialog";
import { ReviewDialog } from "./ReviewDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const appointment = myAppointmentFixtures[1]; // past: Dr. Karim Uddin

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
        <ReviewDialog
          appointment={appointment}
          trigger={
            <DialogTrigger asChild>
              <button type="button">Leave a review</button>
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
  await user.click(screen.getByRole("button", { name: /leave a review/i }));
  const dialog = await screen.findByRole("dialog", {
    name: /review dr\. karim uddin/i,
  });
  return { user, dialog, ...result };
}

describe("ReviewDialog", () => {
  it("asks for a rating before anything else", async () => {
    await renderAndOpen();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("radiogroup", { name: /overall rating/i }),
    ).toBeInTheDocument();
  });

  it("requires a rating and a comment before submitting", async () => {
    const { user, dialog } = await renderAndOpen();

    await user.click(within(dialog).getByRole("button", { name: /submit review/i }));

    expect(
      await within(dialog).findByText(/choose a rating/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/share a few words/i),
    ).toBeInTheDocument();
  });

  it("posts the review and closes on success", async () => {
    let receivedBody = null;
    server.use(
      http.post("/api/reviews", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(
          {
            _id: "r1",
            ...receivedBody,
            userEmail: "rifat@example.com",
            userName: "Rifat Hossain",
            userPhotoURL: "",
            createdAt: "2026-09-28T12:00:00.000Z",
          },
          { status: 201 },
        );
      }),
    );

    const { user, dialog } = await renderAndOpen();

    await user.click(within(dialog).getByRole("radio", { name: "5 stars" }));
    await user.type(
      within(dialog).getByLabelText(/your review/i),
      "Great consultation, very clear explanations.",
    );
    await user.click(
      within(dialog).getByRole("button", { name: /submit review/i }),
    );

    await waitFor(() => {
      expect(receivedBody).toEqual({
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        rating: 5,
        comment: "Great consultation, very clear explanations.",
      });
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("shows the backend 400 inline and keeps the dialog open", async () => {
    server.use(
      http.post("/api/reviews", () =>
        HttpResponse.json({ message: "Already reviewed" }, { status: 400 }),
      ),
    );

    const { user, dialog } = await renderAndOpen();

    await user.click(within(dialog).getByRole("radio", { name: "4 stars" }));
    await user.type(within(dialog).getByLabelText(/your review/i), "Good visit.");
    await user.click(
      within(dialog).getByRole("button", { name: /submit review/i }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      /already reviewed/i,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = await renderAndOpen();

    expect(await axe(container)).toHaveNoViolations();
  });
});
