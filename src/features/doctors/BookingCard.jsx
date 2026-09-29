"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { appointmentSchema } from "@/lib/api/types";
import { formatBDT } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { SlotPicker } from "./SlotPicker";
import { bookedSlotKeys } from "./slots";

/**
 * Booking flow step 1 (task 3.2): fee + slot picking inside the profile's
 * sticky card. Booked slots derive from the public appointment list — used
 * only for doctorId + date + time, never displayed (API_CONTRACT note,
 * DECISIONS B-001); 409 is still handled at submit time (3.3).
 *
 * The component renders whether the user is signed in or not; the actual
 * submit (sign-in gate, form) happens in 3.3/3.4 via onConfirm.
 *
 * @param {{
 *   doctor: import("@/lib/api/types").Doctor,
 *   onConfirm: (slot: { date: string, time: string }) => void,
 * }} props
 */
export function BookingCard({ doctor, onConfirm }) {
  const [slot, setSlot] = useState(null);

  const { data: appointments } = useQuery({
    queryKey: ["public-appointments"],
    queryFn: () =>
      api.get("/api/appointments", z.array(appointmentSchema), {
        skip401Hook: true,
      }),
    staleTime: 60 * 1000,
  });

  const bookedSlots = bookedSlotKeys(appointments ?? [], doctor._id);

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-level-1">
      <h2 className="text-headline-sm text-on-surface">Book a consultation</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {doctor.specialty} · {doctor.name}
      </p>

      <div className="mt-space-md flex items-center justify-between rounded-xl bg-surface-container-low p-space-md">
        <span className="text-label-md text-on-surface-variant">
          Consultation Fee
        </span>
        <span className="text-headline-sm font-bold text-primary tabular-nums">
          {formatBDT(doctor.fee)}
        </span>
      </div>

      <h3 id="slot-grid-label" className="mt-space-md text-label-lg text-on-surface">
        Choose a date and time
      </h3>
      <SlotPicker bookedSlots={bookedSlots} onSelect={setSlot} />

      <Button
        disabled={!slot}
        onClick={() => slot && onConfirm(slot)}
        className="mt-space-md w-full rounded-full"
      >
        Continue
      </Button>
      <p className="mt-2 text-label-md text-on-surface-variant">
        {slot
          ? `Selected: ${slot.date} · ${slot.time}`
          : "Free cancellation up to 24 hrs before your visit."}
      </p>
    </div>
  );
}
