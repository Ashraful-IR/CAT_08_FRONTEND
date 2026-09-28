/**
 * URL ⇄ filter-state coercion for /doctors (DECISIONS D-002: filter state
 * lives in the URL so results are shareable and survive refresh).
 * Kept framework-free (URLSearchParams in/out) so it is unit-testable and
 * usable from both server and client code.
 */

const SORTS = new Set(["rating", "fee_asc", "fee_desc", "name"]);

/**
 * @param {URLSearchParams} params
 * @returns {{ q?: string, specialty?: string[], minFee?: number, maxFee?: number, minRating?: number, sort?: "rating"|"fee_asc"|"fee_desc"|"name" }}
 */
export function parseFilters(params) {
  /** @type {Record<string, unknown>} */
  const filters = {};

  const q = params.get("q")?.trim();
  if (q) {
    filters.q = q;
  }

  const specialties = params.getAll("specialty").filter(Boolean);
  if (specialties.length > 0) {
    filters.specialty = specialties;
  }

  for (const key of ["minFee", "maxFee", "minRating"]) {
    const raw = params.get(key);
    if (raw !== null && raw !== "" && !Number.isNaN(Number(raw))) {
      filters[key] = Number(raw);
    }
  }

  const sort = params.get("sort");
  if (sort && SORTS.has(sort)) {
    filters.sort = sort;
  }

  return filters;
}

/**
 * Inverse of parseFilters — only serializes values that are set, so URLs stay
 * free of empty params.
 *
 * @param {{ q?: string, specialty?: string[], minFee?: number, maxFee?: number, minRating?: number, sort?: "rating"|"fee_asc"|"fee_desc"|"name" }} filters
 * @returns {URLSearchParams}
 */
export function filtersToSearchParams(filters) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }
  for (const specialty of filters.specialty ?? []) {
    params.append("specialty", specialty);
  }
  for (const key of ["minFee", "maxFee", "minRating"]) {
    const value = filters[key];
    if (typeof value === "number" && !Number.isNaN(value)) {
      params.set(key, String(value));
    }
  }
  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  return params;
}

/**
 * Convenience for client components that only have the raw query string
 * (use `useSearchParams().toString()` in components).
 *
 * @param {string} search - query string with or without the leading "?"
 */
export function parseFiltersFromUrl(search) {
  return parseFilters(new URLSearchParams(search));
}
