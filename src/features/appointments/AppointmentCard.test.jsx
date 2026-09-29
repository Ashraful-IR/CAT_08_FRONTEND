import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/mocks/node";
import { myAppointmentFixtures } from "@/mocks/fixtures";
import { Providers } from "@/app/providers";
import { AppointmentCard } from "./AppointmentCard";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

/** Shape mirrors myAppointmentFixtures; doctor joined by the page. */
function appointment(overrides = {}) {
  return {
    _id: "6a51ea90108e8a8b1cab3001",
    userEmail: "rifat@example.com",
    doctorId: "6a51ea90108e8a8b1caaf768",
    doctorName: "Dr. Fatema Begum",
    fee: 1300,
    rating: 4.9,
    patientName: "Rifat Hossain",
    gender: "Male",
    phone: "01712345678",
    appointmentDate: "2026-09-30",
    appointmentTime: "10:00 AM",
    createdAt: "2026-09-27T09:30:00.000Z",
    ...overrides,
  };
}

const doctor = {
  _id: "6a51ea90108e8a8b1caaf768",
  name: "Dr. Fatema Begum",
  specialty: "Gynecologist",
  fee: 1300,
  rating: 4.9,
  photoURL: "https://i.ibb.co/dr-fatema.jpg",
  description: "Expert in women's reproductive health and prenatal care.",
};

beforeAll(() => {
  window.ResizeObserver =
    window.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

describe("AppointmentCard — upcoming", () => {
  it("shows doctor name, specialty, and the booked slot", () => {
    renderCard();

    expect(screen.getByText("Dr. Fatema Begum")).toBeInTheDocument();
    expect(screen.getByText("Gynecologist")).toBeInTheDocument();
    expect(screen.getByText("2026-09-30 · 10:00 AM")).toBeInTheDocument();
  });

  it("shows the consultation fee", () => {
    renderCard();

    expect(screen.getByText("৳1,300")).toBeInTheDocument();
  });

  it("shows the relative-day badge", () => {
    renderCard();

    expect(screen.getByText("In 2 Days")).toBeInTheDocument();
  });

  it("shows the patient details the booking was made for", () => {
    renderCard();

    expect(screen.getByText("Rifat Hossain")).toBeInTheDocument();
    expect(screen.getByText("Male")).toBeInTheDocument();
    expect(screen.getByText("01712345678")).toBeInTheDocument();
  });

  it("renders doctor identity as a link to the profile", () => {
    renderCard();

    const link = screen.getByRole("link", { name: /dr\. fatema begum/i });
    expect(link).toHaveAttribute("href", `/doctors/${doctor._id}`);
  });

  it("offers rescheduling for upcoming visits", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: /reschedule/i }));
    expect(
      await screen.findByRole("dialog", { name: /reschedule/i }),
    ).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderCard();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("AppointmentCard — past", () => {
  it("shows a past badge instead of the countdown", () => {
    renderCard({ appointmentDate: "2026-09-20", appointmentTime: "09:00 AM" }, "8 Days Ago");

    expect(screen.getByText("8 Days Ago")).toBeInTheDocument();
  });

  it("offers no rescheduling for past visits", () => {
    renderCard({ appointmentDate: "2026-09-20", appointmentTime: "09:00 AM" }, "8 Days Ago");

    expect(
      screen.queryByRole("button", { name: /reschedule/i }),
    ).not.toBeInTheDocument();
  });
});

function renderCard(overrides = {}, relativeDay = "In 2 Days") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>
        <AppointmentCard
          appointment={appointment(overrides)}
          doctor={doctor}
          relativeDay={relativeDay}
        />
      </Providers>
    </QueryClientProvider>,
  );
}
