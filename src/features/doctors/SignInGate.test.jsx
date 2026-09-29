import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { SignInGate } from "./SignInGate";
import { doctorFixtures } from "@/mocks/fixtures";

const h = vi.hoisted(() => ({
  pathname: "/doctors/6a51ea90108e8a8b1caaf768",
  search: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => h.pathname,
  useSearchParams: () => h.search,
}));

const doctor = doctorFixtures[0];
const PROFILE_PATH = `/doctors/${doctor._id}`;

describe("SignInGate", () => {
  it("explains that signing in is needed and why", () => {
    render(<SignInGate doctor={doctor} />);

    expect(
      screen.getByRole("heading", { name: /sign in to book/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create a free account or sign in to confirm/i),
    ).toBeInTheDocument();
  });

  it("keeps the consultation fee visible to signed-out visitors", () => {
    render(<SignInGate doctor={doctor} />);

    expect(screen.getByText("৳1,300")).toBeInTheDocument();
  });

  it("carries the current path to /login via ?next=", () => {
    render(<SignInGate doctor={doctor} />);

    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(PROFILE_PATH)}`,
    );
  });

  it("carries next to /register for first-time users", () => {
    render(<SignInGate doctor={doctor} />);

    const link = screen.getByRole("link", { name: /create an account/i });
    expect(link).toHaveAttribute(
      "href",
      `/register?next=${encodeURIComponent(PROFILE_PATH)}`,
    );
  });

  it("preserves the current query string in the return path", () => {
    h.pathname = "/doctors/x";
    h.search = new URLSearchParams("ref=home");

    render(<SignInGate doctor={doctor} />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent("/doctors/x?ref=home")}`,
    );
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<SignInGate doctor={doctor} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
