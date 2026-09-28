import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import RootError from "./error";
import RootLoading from "./loading";

describe("RootLoading", () => {
  it("announces the busy state", () => {
    render(<RootLoading />);
    expect(screen.getByLabelText("Loading content")).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<RootLoading />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("RootError", () => {
  it("renders a friendly message with a working retry action", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<RootError error={new Error("boom")} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /something went wrong/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("never renders the raw error message", () => {
    render(<RootError error={new Error("SECRET-DB-DETAIL")} reset={vi.fn()} />);
    expect(screen.queryByText(/SECRET-DB-DETAIL/i)).not.toBeInTheDocument();
  });
});
