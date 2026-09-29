/**
 * Slot logic for booking (DECISIONS D-003: no availability in the backend —
 * slots are a fixed 09:00–17:00 half-hour grid; booked ones come from the
 * public appointment list filtered by doctorId, see B-001).
 *
 * Time format is the project-wide convention (DECISIONS D-006 / API_CONTRACT):
 * `hh:mm AM/PM` — e.g. "02:30 PM".
 */

/** The fixed bookable grid, `["09:00 AM", …, "04:30 PM"]`. */
export function generateSlotGrid() {
  const slots = [];
  for (let minutes = 9 * 60; minutes < 17 * 60; minutes += 30) {
    const hour24 = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
    slots.push(
      `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`,
    );
  }
  return slots;
}

/**
 * Slot states for one date.
 *
 * @param {{ date: string, todayIso: string, nowMinutes: number, booked: string[] }} options
 * @returns {Array<{ time: string, disabled: boolean, booked: boolean }>}
 */
export function slotsForDate({ date, todayIso, nowMinutes, booked }) {
  if (date < todayIso) {
    return [];
  }

  const bookedSet = new Set(booked);
  const isToday = date === todayIso;

  return generateSlotGrid().map((time) => {
    const bookedSlot = bookedSet.has(`${date} ${time}`);
    const slotMinutes = toMinutes(time);
    const pastSlot = isToday && slotMinutes <= nowMinutes;
    return { time, disabled: bookedSlot || pastSlot, booked: bookedSlot };
  });
}

/**
 * Reduces the public appointment list (B-001: use only doctorId + date +
 * time, never display) to `date time` keys for one doctor.
 *
 * @param {Array<import("@/lib/api/types").Appointment>} appointments
 * @param {string} doctorId
 * @returns {string[]}
 */
export function bookedSlotKeys(appointments, doctorId) {
  return appointments
    .filter((appointment) => appointment.doctorId === doctorId)
    .map((appointment) => {
      const date = appointment.appointmentDate.slice(0, 10);
      return `${date} ${appointment.appointmentTime}`;
    });
}

/** @param {string} time - "hh:mm AM/PM" */
function toMinutes(time) {
  const [, hourStr, minuteStr, period] = time.match(/^(\d+):(\d+) (AM|PM)$/);
  let hour24 = Number(hourStr) % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  return hour24 * 60 + Number(minuteStr);
}
