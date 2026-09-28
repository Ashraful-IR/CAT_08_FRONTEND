import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { vi } from "vitest";
import { server } from "@/mocks/node";
import { doctorFixtures } from "@/mocks/fixtures";
import DoctorsPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/doctors",
}));

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5001";

describe("doctors page", () => {
  it("fetches all doctors on the server and renders the browser", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
    );
    render(await DoctorsPage());

    expect(screen.getByRole("heading", { name: /5 doctors found/i }));
    expect(
      screen.getByRole("link", { name: "Dr. Fatema Begum" }),
    ).toBeInTheDocument();
  });

  it("renders the empty state when the API returns no doctors", async () => {
    server.use(http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json([])));
    render(await DoctorsPage());

    const results = within(screen.getByRole("region", { name: "Doctor results" }));
    expect(results.getByText(/no doctors match/i)).toBeInTheDocument();
  });

  it("exposes SEO metadata", () => {
    expect(metadata).toMatchObject({
      title: expect.stringMatching(/doctors/i),
      description: expect.any(String),
    });
  });

  it("has no axe accessibility violations", async () => {
    server.use(
      http.get(`${BACKEND}/api/doctors`, () => HttpResponse.json(doctorFixtures)),
    );
    const { container } = render(await DoctorsPage());
    expect(await axe(container)).toHaveNoViolations();
  });
});
