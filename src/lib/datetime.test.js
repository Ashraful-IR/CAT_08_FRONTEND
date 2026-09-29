import { describe, expect, it } from "vitest";
import { relativeDay } from "./datetime";

describe("relativeDay", () => {
  it("returns Today for the same day", () => {
    expect(relativeDay("2026-09-28", "2026-09-28")).toBe("Today");
  });

  it("returns Tomorrow for the next day", () => {
    expect(relativeDay("2026-09-29", "2026-09-28")).toBe("Tomorrow");
  });

  it("counts days for later dates", () => {
    expect(relativeDay("2026-09-30", "2026-09-28")).toBe("In 2 Days");
    expect(relativeDay("2026-10-04", "2026-09-28")).toBe("In 6 Days");
  });

  it("counts backwards for past dates", () => {
    expect(relativeDay("2026-09-25", "2026-09-28")).toBe("3 Days Ago");
  });

  it("handles month and year boundaries", () => {
    expect(relativeDay("2026-10-01", "2026-09-28")).toBe("In 3 Days");
    expect(relativeDay("2027-01-01", "2026-12-30")).toBe("In 2 Days");
  });
});
