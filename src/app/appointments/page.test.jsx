import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { Providers } from "@/app/providers";
import AppointmentsPage, { generateMetadata } from "./page";
import {
  doctorFixtures,
  myAppointmentFixtures,
  sessionResponseFixture,
} from "@/mocks/fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/appointments",
  useSearchParams: () => new URLSearchParams(),
}));

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";

beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-28T10:00:00"));
  // serverFetch (Server Component) calls the backend by absolute URL; the
  // browser session/appointments calls go through the relative /api proxy.
  server.use(
    http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
    http.get("/api/auth/session", () =>
      HttpResponse.json(sessionResponseFixture),
    ),
  );
});

afterEach(() => {
  vi.useRealTimers();
});

function renderPage(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Providers>{ui}</Providers>
    </QueryClientProvider>,
  );
}

describe("/appointments page", () => {
  it("greets the user and titles the page", async () => {
    renderPage(await AppointmentsPage());

    expect(
      screen.getByRole("heading", { level: 1, name: /my appointments/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Welcome back, Rifat Hossain/)).toBeInTheDocument();
  });

  it("joins doctor details (specialty, photo) into the cards", async () => {
    renderPage(await AppointmentsPage());

    expect(await screen.findByText("Gynecologist")).toBeInTheDocument();
    expect(screen.getByAltText("Dr. Fatema Begum")).toBeInTheDocument();
  });

  it("falls back to initials when a joined doctor is missing", async () => {
    server.use(
      http.get("/api/appointments/mine", () =>
        HttpResponse.json([
          {
            ...myAppointmentFixtures[0],
            doctorId: "missing-doctor-id",
          },
        ]),
      ),
    );

    renderPage(await AppointmentsPage());

    expect(await screen.findByText("FB")).toBeInTheDocument();
  });

  it("exposes SEO metadata", async () => {
    const metadata = await generateMetadata();

    expect(metadata.title).toContain("My Appointments");
    expect(metadata.description).toBeTruthy();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderPage(await AppointmentsPage());

    await screen.findByRole("tab", { name: /upcoming/i });
    expect(await axe(container)).toHaveNoViolations();
  });
});
