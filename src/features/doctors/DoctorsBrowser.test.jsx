import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { DoctorsBrowser } from "./DoctorsBrowser";
import { doctorFixtures } from "@/mocks/fixtures";

const h = vi.hoisted(() => ({ search: "", push: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: h.push }),
  useSearchParams: () => new URLSearchParams(h.search),
  usePathname: () => "/doctors",
}));

beforeEach(() => {
  h.search = "";
  h.push.mockClear();
});

describe("DoctorsBrowser", () => {
  it("renders a count header and a card per doctor", () => {
    render(<DoctorsBrowser doctors={doctorFixtures} />);
    expect(
      screen.getByRole("heading", { name: /5 doctors found/i }),
    ).toBeInTheDocument();
    for (const doctor of doctorFixtures) {
      expect(screen.getByRole("link", { name: doctor.name })).toBeInTheDocument();
    }
  });

  it("applies URL filters to the list", () => {
    h.search = "specialty=Cardiologist";
    render(<DoctorsBrowser doctors={doctorFixtures} />);
    expect(screen.getByRole("heading", { name: /1 doctor found/i }));
    expect(screen.getByRole("link", { name: "Dr. Ayesha Rahman" }));
    expect(
      screen.queryByRole("link", { name: "Dr. Karim Uddin" }),
    ).not.toBeInTheDocument();
  });

  it("updates the sort param through the sort select", async () => {
    const user = userEvent.setup();
    render(<DoctorsBrowser doctors={doctorFixtures} />);
    await user.selectOptions(screen.getByLabelText("Sort by"), "fee_asc");
    expect(h.push).toHaveBeenCalledWith("/doctors?sort=fee_asc");
  });

  it("orders the cards by the sort param", () => {
    h.search = "sort=fee_asc";
    render(<DoctorsBrowser doctors={doctorFixtures} />);
    // Card names are the level-2 headings inside the results region
    // (the filter sidebar has its own h2).
    const results = within(
      screen.getByRole("region", { name: "Doctor results" }),
    );
    const actual = results
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    const expected = [...doctorFixtures]
      .sort((a, b) => a.fee - b.fee)
      .map((d) => d.name);
    expect(actual).toEqual(expected);
  });

  it("shows the empty state with a clear-filters action", async () => {
    h.search = "q=nobody";
    const user = userEvent.setup();
    render(<DoctorsBrowser doctors={doctorFixtures} />);
    expect(screen.getByText(/no doctors match/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear all filters/i }));
    expect(h.push).toHaveBeenCalledWith("/doctors");
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(<DoctorsBrowser doctors={doctorFixtures} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
