import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";
import { Navbar } from "./Navbar";
import { server } from "@/mocks/node";
import { sessionResponseFixture } from "@/mocks/fixtures";

// Frozen clock: 2026-09-28 → two fixtures upcoming, one past (matches the
// AppointmentsBrowser suite's clock convention).
beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

// UserMenu's sign-out hook uses useRouter; provide a stub router.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/",
}));

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Navbar — appointments count badge", () => {
  it("shows the number of upcoming appointments next to the Appointments link", async () => {
    server.use(
      http.get("/api/auth/session", () => HttpResponse.json(sessionResponseFixture)),
      http.get("/api/appointments/mine", () =>
        HttpResponse.json([
          {
            _id: "appt-up1",
            userEmail: "rifat@example.com",
            doctorId: "768",
            doctorName: "Dr. Ayesha Rahman",
            fee: 1200,
            rating: 4.9,
            patientName: "Rifat",
            gender: "Male",
            phone: "01711111111",
            appointmentDate: "2026-09-30",
            appointmentTime: "10:00 AM",
            createdAt: "2026-09-26T10:00:00.000Z",
          },
          {
            _id: "appt-up2",
            userEmail: "rifat@example.com",
            doctorId: "765",
            doctorName: "Dr. Karim Uddin",
            fee: 900,
            rating: 4.7,
            patientName: "Rifat",
            gender: "Male",
            phone: "01722222222",
            appointmentDate: "2026-10-02",
            appointmentTime: "11:30 AM",
            createdAt: "2026-09-26T11:00:00.000Z",
          },
          {
            _id: "appt-past",
            userEmail: "rifat@example.com",
            doctorId: "765",
            doctorName: "Dr. Karim Uddin",
            fee: 900,
            rating: 4.7,
            patientName: "Rifat",
            gender: "Male",
            phone: "01722222222",
            appointmentDate: "2026-09-20",
            appointmentTime: "09:00 AM",
            createdAt: "2026-09-18T09:00:00.000Z",
          },
        ]),
      ),
    );

    renderWithProviders(<Navbar />);

    // aria-label keeps screen-reader context; the visual badge stays decorative.
    const appointmentsLink = await screen.findByRole("link", {
      name: "Appointments, 2 upcoming",
    });
    expect(appointmentsLink).toHaveAttribute("href", "/appointments");
  });

  it("keeps the plain Appointments link when signed out (no badge fetch bounce)", async () => {
    // Default MSW handlers: session 401 and /appointments/mine returns the
    // fixtures — but signed out the count must not render. Crucially the
    // mine-endpoint 401 must NOT trigger the global redirect (skip401Hook).
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    renderWithProviders(<Navbar />);

    expect(await screen.findByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Appointments" })).toBeInTheDocument();
  });
});
