import { describe, expect, it } from "vitest";
import { ApiError, getErrorMessage } from "./errors";

describe("ApiError", () => {
  it("carries status and message", () => {
    const error = new ApiError(409, "Doctor is already booked at this slot");
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(409);
    expect(error.message).toBe("Doctor is already booked at this slot");
    expect(error.name).toBe("ApiError");
  });
});

describe("getErrorMessage", () => {
  it("returns the message of an ApiError as-is", () => {
    expect(getErrorMessage(new ApiError(404, "Doctor not found"))).toBe("Doctor not found");
  });

  it("falls back to a plain Error's message", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("returns the generic message for unknown throwables", () => {
    expect(getErrorMessage(undefined)).toBe("Something went wrong");
    expect(getErrorMessage(42)).toBe("Something went wrong");
  });
});
