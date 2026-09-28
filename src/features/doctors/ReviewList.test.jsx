import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ReviewList } from "./ReviewList";
import { reviewFixtures } from "@/mocks/fixtures";

describe("ReviewList", () => {
  it("renders reviewer name, rating, comment, and date", () => {
    render(<ReviewList reviews={reviewFixtures} />);

    expect(screen.getByText("Tania Akter")).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(
      screen.getByText(/everything was explained clearly/i),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-09-20")).toBeInTheDocument();
  });

  it("shows initials instead of a photo when userPhotoURL is empty", () => {
    const { container } = render(<ReviewList reviews={reviewFixtures} />);
    // Second fixture has an empty photoURL — "Rahim Mia" → "RM".
    expect(screen.getByText("RM")).toBeInTheDocument();
    // …while the first reviewer (photoURL set) still gets an <img>.
    expect(container.querySelector("img[src]")).not.toBeNull();
  });

  it("shows the empty state when there are no reviews", () => {
    render(<ReviewList reviews={[]} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<ReviewList reviews={reviewFixtures} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
