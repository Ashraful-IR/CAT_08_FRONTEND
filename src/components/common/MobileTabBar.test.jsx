import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MobileTabBar } from "./MobileTabBar";

// usePathname requires a Next router context that jsdom tests don't have,
// so we mock it with a mutable value per test (standard app-router practice).
const { mockPathname } = vi.hoisted(() => ({ mockPathname: { current: "/" } }));
vi.mock("next/navigation", () => ({ usePathname: () => mockPathname.current }));

describe("MobileTabBar", () => {
  it("renders all four tabs", () => {
    render(<MobileTabBar />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /doctors/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();
  });

  it("marks the active tab with aria-current", () => {
    mockPathname.current = "/doctors";
    render(<MobileTabBar />);
    expect(screen.getByRole("link", { name: /doctors/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /home/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("keeps touch targets at least 44px", () => {
    render(<MobileTabBar />);
    for (const link of screen.getAllByRole("link")) {
      expect(link.className).toMatch(/min-h-\[44px\]/);
    }
  });
});
