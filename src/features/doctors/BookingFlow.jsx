"use client";

import { toast } from "sonner";
import { BookingCard } from "./BookingCard";

/**
 * Client bridge between the server-rendered profile page and BookingCard
 * (functions can't cross the server/client boundary). The confirm step is a
 * placeholder toast until task 3.3 replaces it with the booking form +
 * success dialog (DECISIONS → Log).
 *
 * @param {{ doctor: import("@/lib/api/types").Doctor }} props
 */
export function BookingFlow({ doctor }) {
  return (
    <BookingCard
      doctor={doctor}
      onConfirm={({ date, time }) => {
        toast.info(`Slot held: ${date} at ${time}`, {
          description: "The booking form lands in the next step.",
        });
      }}
    />
  );
}
