import { cn } from "./utils";

describe("cn (class merge helper)", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, undefined, null, "", "b")).toBe("a b");
  });

  it("lets later classes win over conflicting earlier ones", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges conditional class objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
