import { describe, expect, it } from "vitest";
import { bookingSchema } from "./schemas";

const validBase = {
  doctorId: "6a51ea90108e8a8b1caaf768",
  patientName: "Rifat Hossain",
  gender: "Male",
  phone: "01712345678",
  appointmentDate: "2026-09-30",
  appointmentTime: "10:00 AM",
};

describe("bookingSchema", () => {
  it("accepts a complete booking", () => {
    expect(bookingSchema.parse(validBase)).toEqual(validBase);
  });

  it("trims the patient name and requires it", () => {
    const parsed = bookingSchema.parse({ ...validBase, patientName: "  Ana  " });
    expect(parsed.patientName).toBe("Ana");
    expect(() =>
      bookingSchema.parse({ ...validBase, patientName: "   " }),
    ).toThrow();
  });

  it("accepts only the documented gender values", () => {
    expect(() => bookingSchema.parse({ ...validBase, gender: "Robot" })).toThrow();
  });

  it("normalises the phone: strips separators, keeps digits and +", () => {
    const parsed = bookingSchema.parse({ ...validBase, phone: " +880 171-234-5678 " });
    expect(parsed.phone).toBe("+8801712345678");
    expect(() =>
      bookingSchema.parse({ ...validBase, phone: "call me maybe" }),
    ).toThrow();
  });

  it("requires a YYYY-MM-DD date that is not in the past", () => {
    expect(() =>
      bookingSchema.parse({ ...validBase, appointmentDate: "30-09-2026" }),
    ).toThrow();
    expect(() =>
      bookingSchema.parse({ ...validBase, appointmentDate: "2020-01-01" }),
    ).toThrow();
  });

  it("requires a time in hh:mm AM/PM format", () => {
    expect(() =>
      bookingSchema.parse({ ...validBase, appointmentTime: "10:00" }),
    ).toThrow();
  });
});
