"use client";

import { useEffect } from "react";
import { CalendarX2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error state for /appointments (same tone as the /doctors
 * boundary; raw error details are never rendered).
 */
export default function AppointmentsError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-margin-mobile py-space-xl text-center md:px-margin"
    >
      <div
        aria-hidden="true"
        className="mb-3 flex size-16 items-center justify-center rounded-full bg-error-container text-error"
      >
        <CalendarX2 className="size-8" />
      </div>
      <h1 className="text-headline-sm text-on-surface">
        Couldn&apos;t load your appointments
      </h1>
      <p className="mt-1 mb-4 max-w-md text-body-sm text-on-surface-variant">
        We had trouble reaching your bookings. Please check your connection and
        try again.
      </p>
      <Button onClick={() => reset()} className="gap-2 rounded-full">
        <RefreshCw aria-hidden="true" className="size-4" />
        Try again
      </Button>
    </section>
  );
}
