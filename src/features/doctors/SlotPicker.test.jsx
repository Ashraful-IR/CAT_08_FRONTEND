import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { vi } from "vitest";
import { SlotPicker } from "./SlotPicker";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

// Freeze time: the fixed slot grid and "today" logic depend on the clock.
const NOW = new Date("2026-09-28T14:10:00");

describe("SlotPicker", () => {
  beforeEach(() => {
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderPicker(overrides = {}) {
    return render(
      <SlotPicker
        doctorId="d1"
        bookedSlots={["2026-09-30 11:00 AM"]}
        onSelect={vi.fn()}
        {...overrides}
      />,
    );
  }

  it("renders the next 7 date tabs starting today", () => {
    renderPicker();
    // 2026-09-28 (Wed) … 2026-10-04
    expect(screen.getByRole("tab", { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /oct 3/i })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(7);
  });

  it("lists the fixed half-hour grid for the selected date", () => {
    renderPicker();
    expect(screen.getByRole("radio", { name: "09:00 AM" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "04:30 PM" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(16);
  });

  it("disables booked slots on the selected date", async () => {
    const user = userEvent.setup();
    renderPicker();

    await user.click(screen.getByRole("tab", { name: /sep 30/i }));
    expect(screen.getByRole("radio", { name: "11:00 AM" })).toBeDisabled();
    // strikethrough styling per DESIGN_SYSTEM → Time slot (on the visible span)
    expect(screen.getByText("11:00 AM")).toHaveClass("line-through");
    expect(screen.getByRole("radio", { name: "11:30 AM" })).toBeEnabled();
  });

  it("disables past slots on today's date", () => {
    renderPicker(); // now = 2:10 PM on 2026-09-28
    expect(screen.getByRole("radio", { name: "02:00 PM" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "02:30 PM" })).toBeEnabled();
  });

  it("reports the selected slot through onSelect", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderPicker({ onSelect });

    await user.click(screen.getByRole("tab", { name: /sep 30/i }));
    await user.click(screen.getByRole("radio", { name: "03:00 PM" }));

    expect(onSelect).toHaveBeenCalledWith({
      date: "2026-09-30",
      time: "03:00 PM",
    });
  });

  it("shows the empty state when no slots remain for a date", () => {
    // Late evening of the only shown day → every slot is in the past.
    // (Slots are computed at render time, so freeze the clock first.)
    vi.setSystemTime(new Date("2026-09-28T23:50:00"));
    renderPicker({ bookedSlots: [], dateCount: 1 });

    expect(screen.getByText(/no slots left/i)).toBeInTheDocument();
  });

  it("has no axe accessibility violations", async () => {
    const { container } = renderPicker();
    expect(await axe(container)).toHaveNoViolations();
  });
});
