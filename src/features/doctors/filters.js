/**
 * Pure filtering/sorting over the full doctor list (ARCHITECTURE → Data
 * fetching). The backend returns all doctors with no query params, so search
 * happens client-side and lives in the URL (shareable state).
 *
 * Fields confirmed to exist (DECISIONS D-001): name, specialty, fee, rating.
 * Filters that need other fields (gender, experience, location) are out of
 * scope per DECISIONS D-002.
 */

/**
 * @param {Array<import("@/lib/api/types").Doctor>} doctors
 * @param {{ q?: string, specialty?: string, minFee?: number, maxFee?: number, sort?: "rating"|"fee_asc"|"fee_desc"|"name" }} filters
 * @returns {Array<import("@/lib/api/types").Doctor>}
 */
export function filterDoctors(doctors, filters = {}) {
  const { q, specialty, minFee, maxFee, sort } = filters;

  let result = doctors;

  if (q) {
    const needle = q.trim().toLowerCase();
    if (needle) {
      result = result.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(needle) ||
          doctor.specialty.toLowerCase().includes(needle) ||
          doctor.description.toLowerCase().includes(needle),
      );
    }
  }

  if (specialty && specialty !== "all") {
    result = result.filter((doctor) => doctor.specialty === specialty);
  }

  if (typeof minFee === "number" && !Number.isNaN(minFee)) {
    result = result.filter((doctor) => doctor.fee >= minFee);
  }

  if (typeof maxFee === "number" && !Number.isNaN(maxFee)) {
    result = result.filter((doctor) => doctor.fee <= maxFee);
  }

  if (sort) {
    result = sortDoctors(result, sort);
  }

  return result;
}

/**
 * @param {Array<import("@/lib/api/types").Doctor>} doctors
 * @param {"rating"|"fee_asc"|"fee_desc"|"name"} sort
 */
export function sortDoctors(doctors, sort) {
  const sorted = [...doctors];
  switch (sort) {
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case "fee_asc":
      sorted.sort((a, b) => a.fee - b.fee);
      break;
    case "fee_desc":
      sorted.sort((a, b) => b.fee - a.fee);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }
  return sorted;
}

/**
 * Distinct specialties in data order — for the filter chip list.
 *
 * @param {Array<import("@/lib/api/types").Doctor>} doctors
 * @returns {string[]}
 */
export function specialtiesOf(doctors) {
  return [...new Set(doctors.map((doctor) => doctor.specialty))];
}
