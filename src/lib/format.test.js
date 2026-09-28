import { describe, expect, it } from "vitest";
import { formatBDT, formatRating } from "./format";

describe("formatBDT", () => {
  it("formats thousands with western grouping and the ৳ symbol", () => {
    expect(formatBDT(1200)).toBe("৳1,200");
  });

  it("formats amounts below 1000 without grouping", () => {
    expect(formatBDT(900)).toBe("৳900");
  });

  it("drops decimal parts of fees", () => {
    expect(formatBDT(1300.75)).toBe("৳1,300");
  });

  it("handles zero", () => {
    expect(formatBDT(0)).toBe("৳0");
  });
});

describe("formatRating", () => {
  it("keeps one decimal", () => {
    expect(formatRating(4.9)).toBe("4.9");
  });

  it("pads whole numbers to one decimal", () => {
    expect(formatRating(5)).toBe("5.0");
  });

  it("rounds to one decimal", () => {
    expect(formatRating(4.75)).toBe("4.8");
  });
});
