import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { TopRatedSection } from "./TopRatedSection";
import { topRatedFixtures } from "@/mocks/fixtures";

describe("TopRatedSection", () => {
  it("renders the heading and a View All Doctors link to /doctors", () => {
    render(<TopRatedSection doctors={topRatedFixtures} />);

    expect(
      screen.getByRole("heading", { level: 2, name: /top rated doctors/i }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /view all doctors/i });
    expect(link).toHaveAttribute("href", "/doctors");
  });

  it("renders a card for each doctor", () => {
    render(<TopRatedSection doctors={topRatedFixtures} />);
    for (const doctor of topRatedFixtures) {
      expect(screen.getByRole("link", { name: doctor.name })).toBeInTheDocument();
    }
  });

  it("shows the empty state when there is no data", () => {
    render(<TopRatedSection doctors={[]} />);
    expect(screen.getByText(/no doctors to show yet/i)).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<TopRatedSection doctors={topRatedFixtures} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
