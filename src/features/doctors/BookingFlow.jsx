"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingCard } from "./BookingCard";
import { BookingForm } from "./BookingForm";

/**
 * Booking flow controller (tasks 3.2–3.4): slot picking → booking form →
 * success dialog → /appointments. A 409 (slot taken while filling the form)
 * returns the user to the picker with the backend's message shown
 * (API_CONTRACT → Status-code handling).
 *
 * The sign-in gate itself is the global 401 handler (SECURITY_AND_AUTH):
 * any authenticated request fired while signed out redirects to
 * /login?next=<profile url> (task 3.4's e2e covers this path).
 *
 * @param {{ doctor: import("@/lib/api/types").Doctor }} props
 */
export function BookingFlow({ doctor }) {
  const router = useRouter();
  const [slot, setSlot] = useState(null);
  const [notice, setNotice] = useState(null);

  function handleBooked(outcome) {
    if (outcome === "slot-taken") {
      setNotice("Doctor is already booked at this slot");
      setSlot(null); // back to the picker for another attempt
    } else if (outcome === "done") {
      setNotice(null);
      router.push("/appointments");
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      {notice && (
        <p role="alert" className="text-body-sm text-error">
          {notice}
        </p>
      )}

      {slot ? (
        <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-level-1">
          <BookingForm doctor={doctor} slot={slot} onBooked={handleBooked} />
        </div>
      ) : (
        <BookingCard doctor={doctor} onConfirm={setSlot} />
      )}
    </div>
  );
}
