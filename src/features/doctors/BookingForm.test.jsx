import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/mocks/node";
import { BookingForm } from "./BookingForm";
import { doctorFixtures } from "@/mocks/fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const doctor = doctorFixtures[0];
const SLOT = { date: "2026-09-30", time: "10:00 AM" };

// The hardcoded slot must never age into the past (bookingSchema rejects
// past dates): freeze "today" at the suite clock, like the sibling tests.
beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

function renderForm(props = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BookingForm
        doctor={doctor}
        slot={SLOT}
        onBooked={vi.fn()}
        {...props}
      />
    </QueryClientProvider>,
  );
}

async function fillValidForm(user) {
  await user.type(screen.getByLabelText("Patient name"), "Rifat Hossain");
  await user.click(screen.getByRole("radio", { name: "Male" }));
  await user.type(screen.getByLabelText(/phone/i), "01712345678");
}

describe("BookingForm", () => {
  it("shows required-field errors when submitted empty", async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(await screen.findByText(/patient name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/select a gender/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid phone/i)).toBeInTheDocument();
  });

  it("posts the booking and opens the success dialog", async () => {
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json(
          {
            _id: "x1",
            id: "x1",
            userEmail: "rifat@example.com",
            doctorId: doctor._id,
            doctorName: doctor.name,
            fee: doctor.fee,
            rating: doctor.rating,
            patientName: "Rifat Hossain",
            gender: "Male",
            phone: "01712345678",
            appointmentDate: SLOT.date,
            appointmentTime: SLOT.time,
            createdAt: "2026-09-28T15:00:00.000Z",
          },
          { status: 201 },
        ),
      ),
    );

    const onBooked = vi.fn();
    const user = userEvent.setup();
    renderForm({ onBooked });

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(
      await screen.findByRole("dialog", { name: /appointment confirmed/i }),
    ).toBeInTheDocument();
    // Success dialog shows the booked slot.
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("2026-09-30 · 10:00 AM")).toBeInTheDocument();
    expect(onBooked).toHaveBeenCalledOnce();
  });

  it("maps a 409 to the slot-taken message and keeps the form open", async () => {
    server.use(
      http.post("/api/appointments", () =>
        HttpResponse.json(
          { message: "Doctor is already booked at this slot" },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));

    expect(
      await screen.findByText(/doctor is already booked at this slot/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm booking/i })).toBeEnabled();
  });

  it("disables the submit button while the booking is pending", async () => {
    server.use(
      http.post("/api/appointments", async () => {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return HttpResponse.json({ message: "slow" }, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /confirm booking/i }));
    expect(screen.getByRole("button", { name: /confirming/i })).toBeDisabled();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });
});
