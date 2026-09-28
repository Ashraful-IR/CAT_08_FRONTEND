import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { FilterSidebar } from "./FilterSidebar";

// Mutable router mock so each test can set the "current" URL.
const h = vi.hoisted(() => ({ search: "", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => new URLSearchParams(h.search),
  usePathname: () => "/doctors",
}));

const specialties = [
  "Cardiologist",
  "Dermatologist",
  "Gynecologist",
  "Orthopedic",
  "Pediatrician",
];

beforeEach(() => {
  h.search = "";
  h.push.mockClear();
});

describe("FilterSidebar", () => {
  it("lists every specialty as a labelled checkbox", () => {
    render(<FilterSidebar specialties={specialties} />);
    for (const specialty of specialties) {
      expect(
        screen.getByRole("checkbox", { name: specialty }),
      ).not.toBeChecked();
    }
  });

  it("reflects specialties already selected in the URL", () => {
    h.search = "specialty=Cardiologist";
    render(<FilterSidebar specialties={specialties} />);
    expect(screen.getByRole("checkbox", { name: "Cardiologist" })).toBeChecked();
  });

  it("pushes the specialty into the URL when checked", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    await user.click(screen.getByRole("checkbox", { name: "Pediatrician" }));
    expect(h.push).toHaveBeenCalledWith("/doctors?specialty=Pediatrician");
  });

  it("keeps other params when toggling a specialty", async () => {
    h.search = "q=dr&minRating=4.5";
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    await user.click(screen.getByRole("checkbox", { name: "Cardiologist" }));
    // Canonical param order as serialized by filtersToSearchParams.
    expect(h.push).toHaveBeenCalledWith(
      "/doctors?q=dr&specialty=Cardiologist&minRating=4.5",
    );
  });

  it("removes the specialty from the URL when unchecked", async () => {
    h.search = "specialty=Cardiologist&sort=rating";
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    await user.click(screen.getByRole("checkbox", { name: "Cardiologist" }));
    expect(h.push).toHaveBeenCalledWith("/doctors?sort=rating");
  });

  it("writes numeric fee bounds on blur and drops junk input", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    const minFee = screen.getByLabelText("Min fee (৳)");
    // The bound is applied when the field loses focus, not per keystroke.
    await user.type(minFee, "1000");
    await user.tab();
    expect(h.push).toHaveBeenLastCalledWith("/doctors?minFee=1000");

    await user.clear(minFee);
    await user.type(minFee, "abc");
    await user.tab();
    expect(h.push).toHaveBeenLastCalledWith("/doctors");
  });

  it("sets a minimum rating through the radio group", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    await user.click(screen.getByRole("radio", { name: "4.8 & above" }));
    expect(h.push).toHaveBeenCalledWith("/doctors?minRating=4.8");
  });

  it("back to any rating clears the minRating param", async () => {
    h.search = "minRating=4.8";
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    expect(screen.getByRole("radio", { name: "4.8 & above" })).toBeChecked();

    await user.click(screen.getByRole("radio", { name: "Any rating" }));
    expect(h.push).toHaveBeenCalledWith("/doctors");
  });

  it("clears every filter with Reset All", async () => {
    h.search = "q=dr&minRating=4.5&specialty=Cardiologist";
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);
    await user.click(screen.getByRole("button", { name: /reset all/i }));
    expect(h.push).toHaveBeenCalledWith("/doctors");
  });

  it("opens the mobile filter sheet and applies filters from there", async () => {
    const user = userEvent.setup();
    render(<FilterSidebar specialties={specialties} />);

    await user.click(screen.getByRole("button", { name: /filters/i }));
    const sheet = screen.getByRole("dialog");
    expect(
      within(sheet).getByRole("heading", { name: /refine doctors/i }),
    ).toBeInTheDocument();

    await user.click(
      within(sheet).getByRole("checkbox", { name: "Dermatologist" }),
    );
    expect(h.push).toHaveBeenCalledWith("/doctors?specialty=Dermatologist");
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<FilterSidebar specialties={specialties} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
