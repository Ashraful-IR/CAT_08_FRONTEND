import { describe, expect, it } from "vitest";
import { safeNextPath } from "./next-path";

describe("safeNextPath (open-redirect guard)", () => {
  it.each(["/appointments", "/doctors/abc?tab=upcoming", "/profile"])(
    "keeps the safe internal path %s",
    (path) => {
      expect(safeNextPath(path)).toBe(path);
    },
  );

  it.each([
    ["//evil.com", "/"],
    ["https://evil.com", "/"],
    ["javascript:alert(1)", "/"],
    ["", "/"],
    [null, "/"],
    [undefined, "/"],
  ])("falls back to / for unsafe value %j", (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });

  it("allows // inside a query string (only the path prefix matters)", () => {
    // Navigates to our own /redirect route; the query is not a redirect target.
    expect(safeNextPath("/redirect?to=//evil.com")).toBe("/redirect?to=//evil.com");
  });
});
