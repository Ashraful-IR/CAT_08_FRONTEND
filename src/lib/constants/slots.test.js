import { describe, expect, it } from "vitest";
import { bookedSlotKeys, generateSlotGrid, slotsForDate } from "./slots";

describe("generateSlotGrid", () => {
  it("creates a half-hour grid from 09:00 to 17:00", () => {
    const slots = generateSlotGrid();
    expect(slots[0]).toBe("09:00 AM");
    expect(slots).toContain("12:30 PM");
    expect(slots).toContain("01:00 PM");
    expect(slots.at(-1)).toBe("04:30 PM");
    expect(slots).toHaveLength(16); // 8h × 2
  });
});

describe("slotsForDate", () => {
  it("moves past slots to disabled when the date is today", () => {
    const slots = slotsForDate({
      date: "2026-09-28",
      todayIso: "2026-09-28",
      nowMinutes: 14 * 60 + 10, // 2:10 PM
      booked: [],
    });
    const morning = slots.find((s) => s.time === "09:00 AM");
    const afternoon = slots.find((s) => s.time === "02:30 PM");
    expect(morning.disabled).toBe(true);
    expect(afternoon.disabled).toBe(false);
    expect(slots).toHaveLength(16);
  });

  it("keeps every slot enabled on a future date", () => {
    const slots = slotsForDate({
      date: "2026-09-30",
      todayIso: "2026-09-28",
      nowMinutes: 0,
      booked: [],
    });
    expect(slots.every((s) => !s.disabled)).toBe(true);
  });

  it("marks booked slots as disabled and booked", () => {
    const slots = slotsForDate({
      date: "2026-09-30",
      todayIso: "2026-09-28",
      nowMinutes: 0,
      booked: ["2026-09-30 11:00 AM"],
    });
    const bookedSlot = slots.find((s) => s.time === "11:00 AM");
    expect(bookedSlot.booked).toBe(true);
    expect(bookedSlot.disabled).toBe(true);
    expect(slots.find((s) => s.time === "11:30 AM").booked).toBe(false);
  });

  it("returns no slots for a past date", () => {
    const slots = slotsForDate({
      date: "2026-09-27",
      todayIso: "2026-09-28",
      nowMinutes: 0,
      booked: [],
    });
    expect(slots).toEqual([]);
  });
});

describe("bookedSlotKeys", () => {
  it("builds doctor-scoped `date time` keys from the public appointment list", () => {
    const appointments = [
      { doctorId: "d1", appointmentDate: "2026-09-30", appointmentTime: "11:00 AM" },
      { doctorId: "d2", appointmentDate: "2026-09-30", appointmentTime: "03:00 PM" },
      { doctorId: "d1", appointmentDate: "2026-09-30", appointmentTime: "01:30 PM" },
    ];
    expect(bookedSlotKeys(appointments, "d1")).toEqual([
      "2026-09-30 11:00 AM",
      "2026-09-30 01:30 PM",
    ]);
  });
});
