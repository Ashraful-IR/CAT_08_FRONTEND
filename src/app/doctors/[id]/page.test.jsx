import { render, screen } from "@testing-library/react";
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

describe("doctor profile page", () => {
  it("renders name, specialty, fee, rating, and description", async () => {
    render(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    expect(
      screen.getByRole("heading", { level: 1, name: doctor.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(doctor.specialty)).toBeInTheDocument();
    expect(screen.getByText("৳1,300")).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText(doctor.description)).toBeInTheDocument();
  });

  it("renders the doctor's reviews", async () => {
    render(await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }));

    expect(
      screen.getByRole("heading", { name: /reviews/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Tania Akter")).toBeInTheDocument();
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
    const { container } = render(
      await ProfilePage({ params: Promise.resolve({ id: doctor._id }) }),
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
