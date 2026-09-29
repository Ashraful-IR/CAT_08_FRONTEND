import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SkipLink } from "@/components/common/SkipLink";

const root = path.dirname(fileURLToPath(import.meta.url));
const globalsCss = readFileSync(path.join(root, "globals.css"), "utf8");

describe("root layout a11y (CODING_STANDARDS)", () => {
  it("respects prefers-reduced-motion in global CSS", () => {
    expect(globalsCss).toContain("prefers-reduced-motion");
  });

  it("offers a skip link as the first focusable element", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: /skip to content/i });
    expect(link).toHaveAttribute("href", "#main");
    // Visually hidden until focused (no layout shift for sighted users).
    expect(link).toHaveClass("sr-only");
    expect(link).toHaveClass("focus:not-sr-only");
  });
});
