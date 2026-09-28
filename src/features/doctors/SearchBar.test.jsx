import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { SearchBar } from "./SearchBar";

const h = vi.hoisted(() => ({ search: "q=ayesha", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => new URLSearchParams(h.search),
  usePathname: () => "/doctors",
}));

beforeEach(() => {
  h.search = "q=ayesha";
  h.push.mockClear();
});

describe("SearchBar", () => {
  it("is prefilled with the q param from the URL", () => {
    render(<SearchBar />);
    expect(screen.getByLabelText("Search")).toHaveValue("ayesha");
  });

  it("rewrites the q param on submit, keeping other filters", async () => {
    h.search = "q=ayesha&specialty=Cardiologist";
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByLabelText("Search");
    await user.clear(input);
    await user.type(input, "heart");
    await user.click(screen.getByRole("button", { name: /find care/i }));

    expect(h.push).toHaveBeenCalledWith(
      "/doctors?q=heart&specialty=Cardiologist",
    );
  });

  it("removes the q param when the input is cleared", async () => {
    h.search = "q=ayesha&sort=rating";
    const user = userEvent.setup();
    render(<SearchBar />);

    await user.clear(screen.getByLabelText("Search"));
    await user.click(screen.getByRole("button", { name: /find care/i }));

    expect(h.push).toHaveBeenCalledWith("/doctors?sort=rating");
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<SearchBar />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
