import { describe, expect, it } from "vitest";
import {
  filtersToSearchParams,
  parseFilters,
  parseFiltersFromUrl,
} from "./url-state";

describe("parseFilters", () => {
  it("reads the q and specialty params", () => {
    const params = new URLSearchParams("q=heart&specialty=Cardiologist");
    expect(parseFilters(params)).toEqual({
      q: "heart",
      specialty: ["Cardiologist"],
    });
  });

  it("reads repeated specialty params as a multi-select", () => {
    const params = new URLSearchParams(
      "specialty=Cardiologist&specialty=Pediatrician",
    );
    expect(parseFilters(params)).toEqual({
      specialty: ["Cardiologist", "Pediatrician"],
    });
  });

  it("coerces the fee range and rating to numbers", () => {
    const params = new URLSearchParams("minFee=900&maxFee=1300&minRating=4.5");
    expect(parseFilters(params)).toEqual({
      minFee: 900,
      maxFee: 1300,
      minRating: 4.5,
    });
  });

  it("drops unparseable numeric params instead of crashing", () => {
    const params = new URLSearchParams("minFee=abc&minRating=");
    expect(parseFilters(params)).toEqual({});
  });

  it("maps the sort param onto the known sort keys", () => {
    const params = new URLSearchParams("sort=fee_desc");
    expect(parseFilters(params)).toEqual({ sort: "fee_desc" });
  });

  it("ignores unknown sort values", () => {
    const params = new URLSearchParams("sort=experience");
    expect(parseFilters(params)).toEqual({});
  });
});

describe("filtersToSearchParams", () => {
  it("round-trips through parseFilters", () => {
    const filters = {
      q: "ayesha",
      specialty: ["Cardiologist", "Pediatrician"],
      minFee: 900,
      maxFee: 1300,
      minRating: 4.5,
      sort: "rating",
    };
    expect(parseFilters(filtersToSearchParams(filters))).toEqual(filters);
  });

  it("omits empty values so the URL stays clean", () => {
    const params = filtersToSearchParams({
      q: "",
      specialty: [],
      minFee: undefined,
      sort: "rating",
    });
    expect(params.toString()).toBe("sort=rating");
  });
});

describe("parseFiltersFromUrl (uses useSearchParams in components)", () => {
  it("parses from a raw query string", () => {
    expect(parseFiltersFromUrl("?q=skin&minFee=1000")).toEqual({
      q: "skin",
      minFee: 1000,
    });
    expect(parseFiltersFromUrl("")).toEqual({});
  });
});
