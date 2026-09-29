import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { rescheduleSchema } from "./schemas";

// No past dates: freeze "today" at 2026-09-28 (matches the suite clock).
describe("rescheduleSchema", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-09-28T10:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  const valid = {
    appointmentDate: "2026-10-02",
    appointmentTime: "02:30 PM",
  };

  it("accepts a future date and valid time", () => {
    expect(rescheduleSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts today (an upcoming slot later today is fine)", () => {
    expect(
      rescheduleSchema.safeParse({
        ...valid,
        appointmentDate: "2026-09-28",
      }).success,
    ).toBe(true);
  });

  it("rejects past dates", () => {
    const result = rescheduleSchema.safeParse({
      ...valid,
      appointmentDate: "2026-09-20",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed dates and times", () => {
    expect(
      rescheduleSchema.safeParse({ ...valid, appointmentDate: "02/10/2026" })
        .success,
    ).toBe(false);
    expect(
      rescheduleSchema.safeParse({ ...valid, appointmentTime: "2:30 PM" })
        .success,
    ).toBe(false);
    expect(
      rescheduleSchema.safeParse({ ...valid, appointmentTime: "25:00 PM" })
        .success,
    ).toBe(false);
  });

  it("keeps patientName/gender/phone out of the patch body", () => {
    const result = rescheduleSchema.safeParse({
      ...valid,
      patientName: "Someone Else",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual(valid);
  });
});
