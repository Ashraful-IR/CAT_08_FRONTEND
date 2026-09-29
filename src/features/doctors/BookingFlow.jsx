"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/features/auth/hooks";
import { SignInGate } from "./SignInGate";
import { BookingCard } from "./BookingCard";
import { BookingForm } from "./BookingForm";

/**
 * Booking flow controller (tasks 3.2–3.4): sign-in gate → slot picking →
 * booking form → success dialog → /appointments.
 *
 * Sign-in gate (task 3.4): signed-out visitors see the SignInGate card (with
 * `?next=` return links) instead of the picker/form, so nobody fills a form
 * they cannot submit. A session that expires mid-flow is caught by the global
 * 401 handler (Providers) which redirects to /login?next=<profile url>.
 *
 * A 409 (slot taken while filling the form) returns the user to the picker
 * with the backend's message shown (API_CONTRACT → Status-code handling).
 *
 * @param {{ doctor: import("@/lib/api/types").Doctor }} props
 */
export function BookingFlow({ doctor }) {
  const router = useRouter();
  const { user, isLoading } = useSession();
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

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading booking options"
        className="flex flex-col gap-space-sm rounded-2xl bg-surface-container-lowest p-space-lg shadow-level-1"
      >
        <div className="h-6 w-32 animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-11 w-full animate-pulse rounded-full bg-surface-container-high" />
        <div className="h-11 w-full animate-pulse rounded-full bg-surface-container-high" />
      </div>
    );
  }

  if (!user) {
    return <SignInGate doctor={doctor} />;
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
