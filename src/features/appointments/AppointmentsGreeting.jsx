"use client";

import { useSession } from "@/features/auth/hooks";

/**
 * Page header for /appointments (design →
 * docappoint_my_appointments_dashboard greeting block). The user's name
 * comes from the session; design extras ("Active Care" tier, patient code)
 * are omitted — no such fields in the backend (D-001).
 */
export function AppointmentsGreeting() {
  const { user } = useSession();

  return (
    <div>
      <h1 className="text-headline-lg text-on-surface">My Appointments</h1>
      <p className="mt-1 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
        <span
          aria-hidden="true"
          className="inline-block size-2 rounded-full bg-primary"
        />
        Welcome back{user ? `, ${user.name}` : ""}
      </p>
    </div>
  );
}
