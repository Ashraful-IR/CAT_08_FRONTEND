import { describe, expect, it } from "vitest";
import { registerSchema, signInSchema, socialSignInResponseSchema } from "./schemas";

const validRegister = {
  name: "Rifat Hossain",
  email: "rifat@example.com",
  photoURL: "https://i.ibb.co/me.jpg",
  password: "Secret1",
  confirmPassword: "Secret1",
};

describe("registerSchema (mirrors API_CONTRACT → Auth, Better Auth)", () => {
  it("accepts a fully valid payload", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it("accepts a 6-char password with no uppercase/lowercase requirement", () => {
    // Better Auth minPasswordLength: 6 — digits-only and all-lowercase pass.
    expect(registerSchema.safeParse({ ...validRegister, password: "123456", confirmPassword: "123456" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...validRegister, password: "abcdef", confirmPassword: "abcdef" }).success).toBe(true);
  });

  it("rejects passwords under 6 characters", () => {
    expect(registerSchema.safeParse({ ...validRegister, password: "sE1", confirmPassword: "sE1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegister, password: "abc12", confirmPassword: "abc12" }).success).toBe(false);
  });

  it("makes photoURL optional (Better Auth image is optional) but still validates https when present", () => {
    const { photoURL: _omitted, ...noPhoto } = validRegister;
    expect(registerSchema.safeParse(noPhoto).success).toBe(true);
    expect(registerSchema.safeParse({ ...validRegister, photoURL: "" }).success).toBe(true);
    expect(registerSchema.safeParse({ ...validRegister, photoURL: "http://i.ibb.co/me.jpg" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegister, photoURL: "not-a-url" }).success).toBe(false);
  });

  it("rejects mismatched confirmPassword (client-side UX check, stripped before sending)", () => {
    expect(registerSchema.safeParse({ ...validRegister, confirmPassword: "Secret2" }).success).toBe(false);
  });

  it.each([
    ["missing name", { name: "" }],
    ["short name", { name: "R" }],
    ["invalid email", { email: "not-an-email" }],
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

describe("socialSignInResponseSchema (POST /auth/sign-in/social)", () => {
  it("accepts { url } with the provider consent url", () => {
    expect(
      socialSignInResponseSchema.safeParse({
        url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=x&state=s",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing or non-url url", () => {
    expect(socialSignInResponseSchema.safeParse({}).success).toBe(false);
    expect(socialSignInResponseSchema.safeParse({ url: "not-a-url" }).success).toBe(false);
  });
});
