import { describe, expect, it } from "vitest";
import {
  parseDoctors,
  parseDoctor,
  parseAppointments,
  parseAppointment,
  parseReviews,
  parseUser,
  doctorSchema,
} from "./types";
import { ApiError } from "./errors";
import { doctorFixtures } from "@/mocks/fixtures";
import { userFixture } from "@/mocks/fixtures";

describe("boundary schemas (types.js)", () => {
  it("accepts the real doctor fixture list", () => {
    expect(parseDoctors(doctorFixtures)).toEqual(doctorFixtures);
  });

  it("accepts a single doctor", () => {
    expect(parseDoctor(doctorFixtures[0])).toEqual(doctorFixtures[0]);
  });

  it("rejects a doctor missing a confirmed field (fee)", () => {
    const bad = { ...doctorFixtures[0] };
    delete bad.fee;
    expect(() => parseDoctor(bad)).toThrow(ApiError);
  });

  it("rejects a non-array where Doctor[] is expected", () => {
    expect(() => parseDoctors({ nope: true })).toThrow(ApiError);
  });

  it("accepts a minimal valid appointment", () => {
    const appointment = {
      _id: "a1",
      userEmail: "p@x.com",
      doctorId: "d1",
      doctorName: "Dr. Who",
      fee: 900,
      rating: 4.5,
      patientName: "Pat",
      gender: "Male",
      phone: "+8801700000000",
      appointmentDate: "2026-10-01",
      appointmentTime: "09:30 AM",
      createdAt: "2026-09-28T10:00:00Z",
    };
    expect(parseAppointments([appointment])).toEqual([appointment]);
  });

  it("accepts a user with the documented shape", () => {
    expect(parseUser(userFixture)).toEqual(userFixture);
  });

  it("exposes the doctor schema for reuse (feature api wrappers)", () => {
    expect(doctorSchema.safeParse(doctorFixtures[0]).success).toBe(true);
  });

  it("accepts a single appointment and a review list", () => {
    const appointment = {
      _id: "a2",
      userEmail: "p@x.com",
      doctorId: "d1",
      doctorName: "Dr. Who",
      fee: 900,
      rating: 4.5,
      patientName: "Pat",
      gender: "Female",
      phone: "+8801700000001",
      appointmentDate: "2026-10-02",
      appointmentTime: "10:00 AM",
      createdAt: "2026-09-28T11:00:00Z",
    };
    expect(parseAppointment(appointment)).toEqual(appointment);

    const review = {
      _id: "r1",
      doctorId: "d1",
      appointmentId: "a2",
      rating: 5,
      comment: "Excellent care.",
      userEmail: "p@x.com",
      userName: "Pat",
      userPhotoURL: "https://i.ibb.co/pat.jpg",
      createdAt: "2026-10-03T09:00:00Z",
    };
    expect(parseReviews([review])).toEqual([review]);
  });
});
