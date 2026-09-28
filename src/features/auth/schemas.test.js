import { describe, expect, it } from "vitest";
import { registerSchema, signInSchema } from "./schemas";

const validRegister = {
  name: "Rifat Hossain",
  email: "rifat@example.com",
  photoURL: "https://i.ibb.co/me.jpg",
  password: "Secret1",
  confirmPassword: "Secret1",
};

describe("registerSchema (mirrors API_CONTRACT → Auth)", () => {
  it("accepts a fully valid payload", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it.each([
    ["missing name", { name: "" }],
    ["short name", { name: "R" }],
    ["invalid email", { email: "not-an-email" }],
    ["http photoURL", { photoURL: "http://i.ibb.co/me.jpg" }],
    ["photoURL without protocol", { photoURL: "i.ibb.co/me.jpg" }],
    ["password without uppercase", { password: "secret1", confirmPassword: "secret1" }],
    ["password without lowercase", { password: "SECRET1", confirmPassword: "SECRET1" }],
    ["password under 6 chars", { password: "sE1", confirmPassword: "sE1" }],
    ["mismatched confirm", { confirmPassword: "Secret2" }],
  ])("rejects %s", (_label, patch) => {
    expect(registerSchema.safeParse({ ...validRegister, ...patch }).success).toBe(false);
  });

  it("trims name and email before validating", () => {
    const parsed = registerSchema.parse({ ...validRegister, name: "  Rifat Hossain  " });
    expect(parsed.name).toBe("Rifat Hossain");
  });
});

describe("signInSchema", () => {
  it("accepts email + password", () => {
    expect(signInSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects an invalid email and an empty password", () => {
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(signInSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});
