import { describe, expect, it } from "vitest";
import { isUpcoming, splitAppointments } from "./split";

// Frozen "now": 2:00 PM on 2026-09-28 (matches the test suites' clock).
const NOW = { date: "2026-09-28", minutes: 14 * 60 };

const pastDate = { appointmentDate: "2026-09-20", appointmentTime: "09:00 AM" };
const todayPastTime = { appointmentDate: "2026-09-28", appointmentTime: "09:00 AM" };
const todayLaterTime = { appointmentDate: "2026-09-28", appointmentTime: "11:30 PM" };
const soon = { appointmentDate: "2026-09-30", appointmentTime: "10:00 AM" };
const soonLater = { appointmentDate: "2026-09-30", appointmentTime: "02:00 PM" };

describe("isUpcoming", () => {
  it("treats a future date as upcoming", () => {
    expect(isUpcoming(soon, NOW)).toBe(true);
  });

  it("treats a past date as past", () => {
    expect(isUpcoming(pastDate, NOW)).toBe(false);
  });

  it("splits same-day appointments by time, not date", () => {
    expect(isUpcoming(todayLaterTime, NOW)).toBe(true);
    expect(isUpcoming(todayPastTime, NOW)).toBe(false);
  });

  it("treats the exact current minute as past (slot already started)", () => {
    expect(isUpcoming(todayPastTime, { date: "2026-09-28", minutes: 540 })).toBe(
      false,
    );
  });
});

describe("splitAppointments", () => {
  it("routes each appointment to the Upcoming or Past tab", () => {
    const { upcoming, past } = splitAppointments(
      [soon, pastDate, todayLaterTime, todayPastTime],
      NOW,
    );

    expect(upcoming).toEqual([todayLaterTime, soon]);
    expect(past).toEqual([todayPastTime, pastDate]);
  });

  it("sorts upcoming soonest-first", () => {
    const { upcoming } = splitAppointments([soonLater, soon, todayLaterTime], NOW);
    expect(upcoming).toEqual([todayLaterTime, soon, soonLater]);
  });

  it("sorts past most-recent-first", () => {
    const { past } = splitAppointments([pastDate, todayPastTime], NOW);
    expect(past).toEqual([todayPastTime, pastDate]);
  });

  it("returns empty tabs for no appointments", () => {
    expect(splitAppointments([], NOW)).toEqual({ upcoming: [], past: [] });
  });
});
