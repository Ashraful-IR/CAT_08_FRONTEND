import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import HomePage from "./page";
import { server } from "@/mocks/node";
import { doctorFixtures, topRatedFixtures } from "@/mocks/fixtures";

// HeroSection (client) reads the router; the page itself is a Server Component.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// serverFetch requests the absolute BACKEND_URL, so the overrides must too
// (same convention as src/lib/api/server.test.js).
const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";

// Awaiting the async Server Component resolves its data-fetching before the
// DOM is queried (mock the network only).
describe("HomePage", () => {
  it("renders the hero heading and top-rated doctors from the API", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
      http.get(`${BACKEND}/api/doctors/top-rated`, () =>
        HttpResponse.json(topRatedFixtures),
      ),
    );
    render(await HomePage());

    expect(
      screen.getByRole("heading", { level: 1, name: /find the right doctor/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /top rated doctors/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Dr. Fatema Begum")).not.toHaveLength(0);
  });

  it("has no axe accessibility violations", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
      http.get(`${BACKEND}/api/doctors/top-rated`, () =>
        HttpResponse.json(topRatedFixtures),
      ),
    );
    const { container } = render(await HomePage());
    expect(await axe(container)).toHaveNoViolations();
  });
});
