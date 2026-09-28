import { describe, expect, it } from "vitest";
import { filterDoctors, sortDoctors, specialtiesOf } from "./filters";
import { doctorFixtures } from "@/mocks/fixtures";

const byId = (list) => list.map((d) => d._id);

describe("filterDoctors", () => {
  it("returns everything when no filters are given", () => {
    expect(filterDoctors(doctorFixtures, {})).toHaveLength(doctorFixtures.length);
  });

  it("matches name case-insensitively", () => {
    const result = filterDoctors(doctorFixtures, { q: "ayesha" });
    expect(byId(result)).toEqual(["6a51ea90108e8a8b1caaf764"]);
  });

  it("matches specialty through the search box too", () => {
    const result = filterDoctors(doctorFixtures, { q: "derma" });
    expect(result[0].specialty).toBe("Dermatologist");
  });

  it("filters by exact specialty", () => {
    const result = filterDoctors(doctorFixtures, { specialty: "Cardiologist" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Dr. Ayesha Rahman");
  });

  it("treats 'all' as no specialty filter", () => {
    expect(filterDoctors(doctorFixtures, { specialty: "all" })).toHaveLength(
      doctorFixtures.length,
    );
  });

  it("applies fee range bounds inclusively", () => {
    const result = filterDoctors(doctorFixtures, { minFee: 1000, maxFee: 1300 });
    for (const doctor of result) {
      expect(doctor.fee).toBeGreaterThanOrEqual(1000);
      expect(doctor.fee).toBeLessThanOrEqual(1300);
    }
    expect(result.some((d) => d.fee === 1500)).toBe(false);
    expect(result.some((d) => d.fee === 900)).toBe(false);
  });

  it("chains search + specialty + fee together", () => {
    const result = filterDoctors(doctorFixtures, {
      q: "dr",
      specialty: "Cardiologist",
      minFee: 1400,
    });
    expect(result).toHaveLength(1);
  });

  it("filters by multiple selected specialties", () => {
    const result = filterDoctors(doctorFixtures, {
      specialty: ["Cardiologist", "Pediatrician"],
    });
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.specialty).sort()).toEqual([
      "Cardiologist",
      "Pediatrician",
    ]);
  });

  it("treats an 'all' entry in a specialty list as no filter", () => {
    expect(filterDoctors(doctorFixtures, { specialty: ["all"] })).toHaveLength(
      doctorFixtures.length,
    );
  });

  it("filters by minimum rating inclusively", () => {
    const result = filterDoctors(doctorFixtures, { minRating: 4.8 });
    expect(result).toHaveLength(3);
    for (const doctor of result) {
      expect(doctor.rating).toBeGreaterThanOrEqual(4.8);
    }
  });
});

describe("sortDoctors", () => {
  it("sorts by rating descending", () => {
    const [first] = sortDoctors(doctorFixtures, "rating");
    expect(first.rating).toBe(4.9);
  });

  it("sorts by fee ascending and descending", () => {
    const [cheapest] = sortDoctors(doctorFixtures, "fee_asc");
    expect(cheapest.fee).toBe(900);
    const [priciest] = sortDoctors(doctorFixtures, "fee_desc");
    expect(priciest.fee).toBe(1500);
  });

  it("sorts by name alphabetically", () => {
    const names = sortDoctors(doctorFixtures, "name").map((d) => d.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("does not mutate the input array", () => {
    const before = doctorFixtures.map((d) => d._id);
    sortDoctors(doctorFixtures, "fee_asc");
    expect(doctorFixtures.map((d) => d._id)).toEqual(before);
  });
});

describe("specialtiesOf", () => {
  it("returns distinct specialties in data order", () => {
    expect(specialtiesOf(doctorFixtures)).toEqual([
      "Gynecologist",
      "Dermatologist",
      "Cardiologist",
      "Orthopedic",
      "Pediatrician",
    ]);
  });
});
