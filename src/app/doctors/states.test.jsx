import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import DoctorsError from "./error";
import DoctorsLoading from "./loading";

describe("DoctorsLoading (route-level skeleton)", () => {
  it("announces the busy state and mirrors the results layout", () => {
    render(<DoctorsLoading />);

    expect(screen.getByLabelText("Loading doctors")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Doctor results" }),
    ).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<DoctorsLoading />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("DoctorsError (route-level error boundary)", () => {
  it("renders a friendly message with a working retry action", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<DoctorsError error={new Error("boom")} reset={reset} />);

    expect(screen.getByRole("heading", { name: /unable to load/i }));
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("never renders the raw error message", () => {
    render(<DoctorsError error={new Error("SECRET-DB-DETAIL")} reset={vi.fn()} />);
    expect(screen.queryByText(/SECRET-DB-DETAIL/i)).not.toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(
      <DoctorsError error={new Error("boom")} reset={vi.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
