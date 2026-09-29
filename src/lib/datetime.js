/**
 * Date/time helpers for the appointment lifecycle. Dates are YYYY-MM-DD and
 * times hh:mm AM/PM everywhere (DECISIONS D-006); "now" is injectable so
 * tests can freeze the clock.
 */

/** Local-calendar YYYY-MM-DD (never toISOString — that is UTC and can shift the day). */
export function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Human relative day between an appointment's date and today, e.g.
 * "Today", "Tomorrow", "In 2 Days", "3 Days Ago" (design: the badge on each
 * appointment card).
 *
 * @param {string} date - YYYY-MM-DD
 * @param {string} todayIso - YYYY-MM-DD
 * @returns {string}
 */
export function relativeDay(date, todayIso) {
  const [y1, m1, d1] = date.split("-").map(Number);
  const [y2, m2, d2] = todayIso.split("-").map(Number);
  // Date.UTC keeps this a pure calendar-day difference (no DST shifts).
  const diffDays = Math.round(
    (Date.UTC(y1, m1 - 1, d1) - Date.UTC(y2, m2 - 1, d2)) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1) return `In ${diffDays} Days`;
  return `${Math.abs(diffDays)} Days Ago`;
}
