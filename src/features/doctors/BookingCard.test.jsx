import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { BookingCard } from "./BookingCard";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("BookingCard", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-09-28T14:10:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("greys out slots already booked for this doctor", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <BookingCard doctor={doctorFixture()} onConfirm={vi.fn()} />,
    );

    // Default MSW handler serves publicAppointmentFixtures (doctor 768 has
    // 2026-09-30 11:00 AM and 02:00 PM booked).
    await user.click(await screen.findByRole("tab", { name: /sep 30/i }));
    expect(screen.getByText("11:00 AM")).toHaveClass("line-through");
    expect(screen.getByText("02:00 PM")).toHaveClass("line-through");
  });

  it("passes the chosen slot to onConfirm", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <BookingCard doctor={doctorFixture()} onConfirm={onConfirm} />,
    );

    // Now = 2:10 PM, so 2:30 PM today is the first selectable slot.
    await user.click(screen.getByRole("radio", { name: "02:30 PM" }));
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(onConfirm).toHaveBeenCalledWith({
      date: "2026-09-28",
      time: "02:30 PM",
    });
  });

  it("disables Continue until a slot is selected", () => {
    renderWithProviders(
      <BookingCard doctor={doctorFixture()} onConfirm={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderWithProviders(
      <BookingCard doctor={doctorFixture()} onConfirm={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

function doctorFixture() {
  return {
    _id: "6a51ea90108e8a8b1caaf768",
    name: "Dr. Fatema Begum",
    specialty: "Gynecologist",
    fee: 1300,
    rating: 4.9,
    photoURL: "https://i.ibb.co/dr-fatema.jpg",
    description: "Expert in women's reproductive health and prenatal care.",
  };
}
