import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { axe } from "jest-axe";
import HomePage from "./page";

function renderWithProviders(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("HomePage (scaffold)", () => {
  // Layout landmarks (banner/main/contentinfo) are verified in e2e/not-found.spec.js,
  // since component tests render this page outside the root layout.
  it("renders the product name as a level-one heading", () => {
    renderWithProviders(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /docappoint/i }),
    ).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderWithProviders(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
