"use client";

import { useMemo, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { slotsForDate } from "./slots";

const DAY_MS = 24 * 60 * 60 * 1000;
const NOON_MINUTES = 12 * 60;

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

/** "Wed" / "30" — stacked chip labels from a local Date. */
function chipLabels(date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNumber = String(date.getDate());
  return { weekday, dayNumber };
}

/** Accessible name for a date chip: "Today · Sep 28" or "Sep 30". */
function tabName(date, todayIso) {
  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return toIsoDate(date) === todayIso ? `Today · ${monthDay}` : monthDay;
}

/**
 * Slot picker for the booking flow (DECISIONS D-003 fixed grid; design →
 * docappoint_doctor_profile_booking_flow). Date chips mirror the design's
 * stacked weekday + day number; slots are grouped Morning (before noon) and
 * Afternoon (noon onward) like the design's two grid sections. Hand-rolled
 * tabs follow the WAI-ARIA tabs pattern with manual arrow-key navigation;
 * each section is a radio group so selection is announced.
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

  const morning = slots.filter(
    (slot) => toMinutes(slot.time) < NOON_MINUTES,
  );
  const afternoon = slots.filter(
    (slot) => toMinutes(slot.time) >= NOON_MINUTES,
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Appointment date"
        onKeyDown={handleKeyDown}
        className="flex gap-2 overflow-x-auto pb-1"
      >
        {dates.map((date) => {
          const active = date === activeDate;
          const { weekday, dayNumber } = chipLabels(
            new Date(`${date}T12:00:00`),
          );
          return (
            <button
              key={date}
              id={`date-tab-${date}`}
              role="tab"
              aria-selected={active}
              aria-controls="slot-panel"
              tabIndex={active ? 0 : -1}
              aria-label={tabName(new Date(`${date}T12:00:00`), todayIso)}
              onClick={() => setActiveDate(date)}
              className="flex min-w-14 shrink-0 flex-col items-center justify-center rounded-xl px-3 py-2 text-label-md text-on-surface-variant transition-colors outline-none hover:bg-surface-container-low focus-visible:ring-3 focus-visible:ring-ring/50 aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:shadow-level-1"
            >
              <span className="text-label-sm opacity-90">{weekday}</span>
              <span
                aria-hidden="true"
                className="text-headline-sm font-bold tabular-nums"
              >
                {dayNumber}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="slot-panel"
        role="tabpanel"
        aria-label={`Slots for ${activeDate}`}
      >
        {/* Empty state fires when nothing is selectable (all past or all booked). */}
        {slots.every((slot) => slot.disabled) ? (
          <p className="mt-space-md rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface-variant">
            No slots left for this day. Please pick another date.
          </p>
        ) : (
          <div className="mt-space-md flex flex-col gap-space-md">
            <SlotSection
              id="morning"
              title="Morning"
              ariaLabel="Morning slots"
              slots={morning}
              onSelect={onSelect}
              activeDate={activeDate}
            />
            <SlotSection
              id="afternoon"
              title="Afternoon"
              ariaLabel="Afternoon slots"
              slots={afternoon}
              onSelect={onSelect}
              activeDate={activeDate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One Morning/Afternoon section: heading + radio group of slot chips.
 * Booked chips keep the strikethrough treatment (DESIGN_SYSTEM → Time slot).
 */
function SlotSection({ id, title, ariaLabel, slots, onSelect, activeDate }) {
  if (slots.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p
        id={`${id}-label`}
        className="text-label-sm font-medium text-on-surface-variant"
      >
        {title}
      </p>
      <RadioGroup
        aria-label={ariaLabel}
        className="grid grid-cols-3 gap-2 sm:grid-cols-4"
        onValueChange={(time) => onSelect({ date: activeDate, time })}
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
              className={`flex min-h-11 w-full items-center justify-center rounded-lg py-2 px-3 text-label-md text-center transition-all peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 ${
                slot.booked
                  ? "line-through text-on-surface-variant/60 bg-surface-container-low"
                  : "bg-surface-container-low hover:bg-surface-container-high text-on-surface peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:font-bold peer-checked:shadow-level-1"
              } ${slot.disabled && !slot.booked ? "text-on-surface-variant/40" : ""}`}
            >
              {slot.time}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

/** "hh:mm AM/PM" → minutes since midnight (mirrors slots.js). */
function toMinutes(time) {
  const [, hourStr, minuteStr, period] = time.match(
    /^(\d+):(\d+) (AM|PM)$/,
  );
  let hour24 = Number(hourStr) % 12;
  if (period === "PM") {
    hour24 += 12;
  }
  return hour24 * 60 + Number(minuteStr);
}
