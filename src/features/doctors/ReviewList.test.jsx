import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ReviewList } from "./ReviewList";
import { reviewFixtures } from "@/mocks/fixtures";

describe("ReviewList", () => {
  it("renders reviewer name, summary rating, comment, and date", () => {
    render(<ReviewList reviews={reviewFixtures} rating={4.9} />);

    expect(screen.getByText("Tania Akter")).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(
      screen.getByText(/based on 2 patient reviews/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/everything was explained clearly/i),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-09-20")).toBeInTheDocument();
  });

  it("marks every reviewer as a verified patient (backend enforces booking-backed reviews)", () => {
    render(<ReviewList reviews={reviewFixtures} rating={4.9} />);

    expect(screen.getAllByText("Verified patient")).toHaveLength(2);
  });

  it("exposes each review's star rating to assistive tech", () => {
    render(<ReviewList reviews={reviewFixtures} rating={4.9} />);

    expect(
      screen.getByRole("img", { name: "Rated 5.0 out of 5" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Rated 4.0 out of 5" }),
    ).toBeInTheDocument();
  });

  it("renders the rating distribution from the real reviews", () => {
    // Fixtures: one 5-star and one 4-star review → 50% each.
    render(<ReviewList reviews={reviewFixtures} rating={4.9} />);

    expect(screen.getByText("5 star")).toBeInTheDocument();
    expect(screen.getByText("4 star")).toBeInTheDocument();
    expect(screen.getAllByText("50%")).toHaveLength(2);
  });

  it("shows initials instead of a photo when userPhotoURL is empty", () => {
    const { container } = render(<ReviewList reviews={reviewFixtures} rating={4.9} />);
    // Second fixture has an empty photoURL — "Rahim Mia" → "RM".
    expect(screen.getByText("RM")).toBeInTheDocument();
    // …while the first reviewer (photoURL set) still gets an <img>.
    expect(container.querySelector("img[src]")).not.toBeNull();
  });

  it("shows the empty state when there are no reviews", () => {
    render(<ReviewList reviews={[]} rating={4.9} />);
    expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(
      <ReviewList reviews={reviewFixtures} rating={4.9} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
