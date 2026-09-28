"use client";

import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { slotsForDate } from "./slots";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local-calendar YYYY-MM-DD (never toISOString — that is UTC and can shift the day). */
function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Minutes since local midnight. */
function nowMinutes(now) {
  return now.getHours() * 60 + now.getMinutes();
}

/** "Mon", "Sep 30" — tab labels from a local Date. */
function tabLabel(date, todayIso) {
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return toIsoDate(date) === todayIso ? `Today · ${label}` : label;
}

/**
 * Slot picker for the booking flow (DECISIONS D-003 fixed grid; design →
 * docappoint_doctor_profile_booking_flow). Hand-rolled tabs follow the WAI-ARIA
 * tabs pattern with manual arrow-key navigation; slots are a radio group so
 * the selection is announced. Group label is rendered in the booking card
 * (aria-labelledby).
 *
 * @param {{
 *   bookedSlots?: string[],
 *   onSelect: (slot: { date: string, time: string }) => void,
 *   dateCount?: number,
 * }} props
 */
export function SlotPicker({ bookedSlots = [], onSelect, dateCount = 7 }) {
  const todayIso = toIsoDate(new Date());
  const dates = useMemo(
    () =>
      Array.from({ length: dateCount }, (_, index) =>
        toIsoDate(new Date(Date.now() + index * DAY_MS)),
      ),
    [dateCount],
  );
  const [activeDate, setActiveDate] = useState(dates[0]);

  const slots = slotsForDate({
    date: activeDate,
    todayIso,
    nowMinutes: nowMinutes(new Date()),
    booked: bookedSlots,
  });

  function handleKeyDown(event) {
    const index = dates.indexOf(activeDate);
    let next = null;
    if (event.key === "ArrowRight") {
      next = dates[Math.min(index + 1, dates.length - 1)];
    } else if (event.key === "ArrowLeft") {
      next = dates[Math.max(index - 1, 0)];
    }
    if (next) {
      event.preventDefault();
      setActiveDate(next);
      document.getElementById(`date-tab-${next}`)?.focus();
    }
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Appointment date"
        onKeyDown={handleKeyDown}
        className="flex gap-1 overflow-x-auto"
      >
        {dates.map((date) => {
          const active = date === activeDate;
          return (
            <button
              key={date}
              id={`date-tab-${date}`}
              role="tab"
              aria-selected={active}
              aria-controls="slot-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveDate(date)}
              className="min-h-11 shrink-0 rounded-full px-4 py-2 text-label-md whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 outline-none aria-selected:bg-primary aria-selected:text-primary-foreground text-on-surface-variant hover:bg-surface-container-low"
            >
              {tabLabel(new Date(`${date}T12:00:00`), todayIso)}
            </button>
          );
        })}
      </div>

      <div id="slot-panel" role="tabpanel" aria-label={`Slots for ${activeDate}`}>
        {/* Empty state fires when nothing is selectable (all past or all booked). */}
        {slots.every((slot) => slot.disabled) ? (
          <p className="mt-space-md rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface-variant">
            No slots left for this day. Please pick another date.
          </p>
        ) : (
          <RadioGroup
            aria-labelledby="slot-grid-label"
            className="mt-space-md grid grid-cols-3 gap-2 sm:grid-cols-4"
            onValueChange={(time) =>
              onSelect({ date: activeDate, time })
            }
          >
            {slots.map((slot) => (
              <label
                key={slot.time}
                className="flex cursor-pointer items-center justify-center"
              >
                <RadioGroupItem
                  value={slot.time}
                  disabled={slot.disabled}
                  className="sr-only peer"
                />
                <span
                  className={`flex min-h-11 w-full items-center justify-center rounded-full border border-outline-variant text-label-md transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 ${
                    slot.booked
                      ? "line-through text-on-surface-variant/60 bg-surface-container-low"
                      : "text-on-surface peer-checked:border-primary peer-checked:bg-primary-container peer-checked:text-on-primary-container"
                  } ${slot.disabled && !slot.booked ? "text-on-surface-variant/40" : ""}`}
                >
                  {slot.time}
                </span>
              </label>
            ))}
          </RadioGroup>
        )}
      </div>
    </div>
  );
}
