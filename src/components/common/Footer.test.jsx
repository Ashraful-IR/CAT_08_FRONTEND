import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

/**
 * Design reference: docappoint_doctor_profile_booking_flow/code.html →
 * <footer> (the only screen that ships one). Content trimmed to real data —
 * the design's HIPAA/SSL/Medical-Board chips and third-party link columns
 * have no backing routes or fields (DECISIONS: no fabricated content).
 */
describe("Footer", () => {
  it("renders the contentinfo landmark with branding and blurb", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("img", { name: "DocAppoint" })).toBeInTheDocument();
    expect(
      within(footer).getByText(/book verified doctors with clear upfront fees/i),
    ).toBeInTheDocument();
  });

  it("shows the medical emergency notice strip from the design", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(
      within(footer).getByText("Medical Emergency Notice:"),
    ).toBeInTheDocument();
    expect(
      within(footer).getByText(/nearest emergency centre/i),
    ).toBeInTheDocument();
  });

  it("links the Patients column to real routes only", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    const patients = within(footer).getByRole("navigation", { name: /patients/i });
    expect(
      within(patients).getByRole("link", { name: /find a doctor/i }),
    ).toHaveAttribute("href", "/doctors");
    expect(
      within(patients).getByRole("link", { name: /my appointments/i }),
    ).toHaveAttribute("href", "/appointments");
    expect(
      within(patients).getByRole("link", { name: /sign in/i }),
    ).toHaveAttribute("href", "/login");
    expect(
      within(patients).getByRole("link", { name: /create an account/i }),
    ).toHaveAttribute("href", "/register");
  });

  it("omits link columns whose pages do not exist (no dead links)", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(
      within(footer).queryByRole("navigation", { name: /specialties/i }),
    ).not.toBeInTheDocument();
    expect(
      within(footer).queryByRole("navigation", { name: /clinical care/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the copyright with the current year", () => {
    render(<Footer />);

    expect(
      screen.getByText(new RegExp(String(new Date().getFullYear()))),
    ).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
