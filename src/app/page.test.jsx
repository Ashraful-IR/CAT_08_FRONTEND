import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import HomePage from "./page";

describe("HomePage (scaffold)", () => {
  it("renders the product name as a level-one heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /docappoint/i })).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
