import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { doctorFixtures, reviewFixtures } from "@/mocks/fixtures";
import ProfilePage, { generateMetadata } from "./page";

const h = vi.hoisted(() => ({
  // Real notFound() throws a sentinel that Next's router catches — mirror that.
  notFound: vi.fn(() => {
    throw new Error("NEXT_HTTP_ERROR_FALLBACK;404");
  }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/doctors",
  notFound: h.notFound,
}));

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";
const doctor = doctorFixtures[0];

beforeEach(() => {
  h.notFound.mockClear();
  server.use(
    http.get(`${BACKEND}/api/doctors/${doctor._id}`, () =>
      HttpResponse.json(doctor),
    ),
    http.get(`${BACKEND}/api/reviews/${doctor._id}`, () =>
      HttpResponse.json(reviewFixtures),
    ),
  );
});

// BookingFlow (client) uses TanStack Query; provide a fresh client per test.
function renderPage(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("doctor profile page", () => {
  it("renders name, specialty, fee, rating, and description", async () => {
    renderPage(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    expect(
      screen.getByRole("heading", { level: 1, name: doctor.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(doctor.specialty)).toBeInTheDocument();
    expect(screen.getByText(doctor.description)).toBeInTheDocument();
  });

  it("renders the doctor's reviews", async () => {
    renderPage(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    expect(
      screen.getByRole("heading", { name: /reviews/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Tania Akter")).toBeInTheDocument();
  });

  it("presents the photo as a circular portrait with a verified badge", async () => {
    renderPage(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    // Design: circular portrait with a verified badge pinned to its edge.
    expect(screen.getByAltText(doctor.name)).toHaveClass("rounded-full");
    expect(
      screen.getByTitle("Verified medical specialist"),
    ).toBeInTheDocument();
  });

  it("shows the specialty as a pill chip", async () => {
    renderPage(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    const chip = screen.getByText(doctor.specialty);
    expect(chip).toHaveClass("rounded-full");
  });

  it("keeps the fee and rating in the hero stat strip", async () => {
    renderPage(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    expect(screen.getByText("Consultation fee")).toBeInTheDocument();
    expect(screen.getByText("৳1,300")).toBeInTheDocument();
    // Rating appears in both the hero pill and the stat strip (design).
    expect(screen.getAllByText("4.9").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("/ 5")).toBeInTheDocument();
  });

  it("offers a breadcrumb back to the doctor list", async () => {
    renderPage(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    const breadcrumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(within(breadcrumb).getByRole("link", { name: "Doctors" })).toBeInTheDocument();
    expect(within(breadcrumb).getByText(doctor.name)).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("calls notFound when the backend does not know the doctor", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors/unknown`, () =>
        HttpResponse.json({ message: "Doctor not found" }, { status: 404 }),
      ),
      http.get(`${BACKEND}/api/reviews/unknown`, () => HttpResponse.json([])),
    );

    await expect(
      ProfilePage({ params: Promise.resolve({ id: "unknown" }) }),
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(h.notFound).toHaveBeenCalledOnce();
  });

  it("exposes SEO metadata from the doctor data", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ id: doctor._id }),
    });
    expect(metadata.title).toContain(doctor.name);
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderPage(
      await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
