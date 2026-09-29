import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";
import HomePage, { generateMetadata } from "./page";

// Server data comes through the feature API layer; MSW covers the network.
vi.mock("@/features/doctors/api", () => ({
  getDoctors: vi.fn(async () => []),
  getTopRated: vi.fn(async () => []),
}));

import { HeroSection } from "@/features/doctors/HeroSection";
import { TopRatedSection } from "@/features/doctors/TopRatedSection";

vi.mock("@/features/doctors/HeroSection", () => ({
  HeroSection: vi.fn(() => <div data-testid="hero" />),
}));
vi.mock("@/features/doctors/TopRatedSection", () => ({
  TopRatedSection: vi.fn(() => <div data-testid="top-rated" />),
}));

describe("home page", () => {
  it("renders the hero and top-rated sections", async () => {
    const { container } = render(await HomePage());

    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("top-rated")).toBeInTheDocument();
    expect(container).toBeInTheDocument();
  });

  it("exposes SEO metadata", async () => {
    const metadata = await generateMetadata();
    expect(metadata.title).toContain("DocAppoint");
    expect(metadata.description).toBeTruthy();
  });
});
