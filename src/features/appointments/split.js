/**
 * Upcoming/Past classification for the /appointments tabs (roadmap 4.1;
 * DECISIONS D-008: there is no status field — an appointment is Upcoming
 * while its date+time is still ahead of the viewer's now, otherwise Past.
 * Cancel is a delete, so there is no Cancelled tab.)
 */

/** "hh:mm AM/PM" → minutes since midnight. */
function toMinutes(time) {
  const [, hourStr, minuteStr, period] = time.match(/^(\d+):(\d+) (AM|PM)$/);
  let hour24 = Number(hourStr) % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  return hour24 * 60 + Number(minuteStr);
}

/** Sort key: date asc, then time asc. */
function ascending(appointment) {
  return `${appointment.appointmentDate} ${toMinutes(appointment.appointmentTime)
    .toString()
    .padStart(4, "0")}`;
}

/**
 * @param {{ appointmentDate: string, appointmentTime: string }} appointment
 * @param {{ date: string, minutes: number }} now - frozen "now" for tests
 * @returns {boolean} true when the slot is still ahead of `now`
 */
export function isUpcoming(appointment, now) {
  if (appointment.appointmentDate !== now.date) {
    return appointment.appointmentDate > now.date;
  }
  return toMinutes(appointment.appointmentTime) > now.minutes;
}

/**
 * Splits and sorts appointments for the two tabs: upcoming soonest-first,
 * past most-recent-first (both put the next actionable visit on top).
 *
 * @param {Array<import("@/lib/api/types").Appointment>} appointments
 * @param {{ date: string, minutes: number }} now
 * @returns {{ upcoming: Array, past: Array }}
 */
export function splitAppointments(appointments, now) {
  const upcoming = [];
  const past = [];
  for (const appointment of appointments) {
    (isUpcoming(appointment, now) ? upcoming : past).push(appointment);
  }
  upcoming.sort((a, b) => ascending(a).localeCompare(ascending(b)));
  past.sort((a, b) => ascending(b).localeCompare(ascending(a)));
  return { upcoming, past };
}
