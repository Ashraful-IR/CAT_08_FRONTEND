/**
 * Content rules (DESIGN_SYSTEM): currency as `৳1,200` (western digit grouping),
 * ratings with one decimal. ICU's BDT locale data does not reliably render the
 * ৳ symbol, so the symbol is applied explicitly and the digits are grouped
 * with a stable en-US formatter.
 */

/** Formats a number as Bangladeshi Taka, e.g. 1200 → "৳1,200". */
export function formatBDT(amount) {
  return `৳${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.trunc(amount))}`;
}

/** Formats a rating with exactly one decimal, e.g. 4.9 → "4.9". */
export function formatRating(rating) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating);
}
