"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CalendarX2, Clock3, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { relativeDay, toIsoDate } from "@/lib/datetime";
import { useMyAppointments } from "./hooks";
import { splitAppointments } from "./split";
import { AppointmentCard } from "./AppointmentCard";

/**
 * /appointments content (roadmap 4.1; design →
 * docappoint_my_appointments_dashboard segmented tabs): Upcoming and Past
 * tabs with live counts (D-008 — no status field, no Cancelled tab), each
 * rendering its list through splitAppointments. Data is auth'd, so it loads
 * through TanStack Query with loading/empty/error states.
 *
 * @param {{ doctorsById?: Record<string, import("@/lib/api/types").Doctor> }} props
 */
export function AppointmentsBrowser({ doctorsById = {} }) {
  const { data: appointments, isError, isPending, refetch } = useMyAppointments();
  const [activeTab, setActiveTab] = useState("upcoming");
  const tablistRef = useRef(null);

  if (isPending) {
    return <BrowserSkeleton />;
  }

  if (isError) {
    return (
      <section
        role="alert"
        className="flex flex-col items-center rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-level-1"
      >
        <div
          aria-hidden="true"
          className="mb-3 flex size-16 items-center justify-center rounded-full bg-error-container text-error"
        >
          <CalendarX2 className="size-8" />
        </div>
        <h2 className="text-headline-sm text-on-surface">
          Couldn&apos;t load your appointments
        </h2>
        <p className="mt-1 mb-4 max-w-md text-body-sm text-on-surface-variant">
          We had trouble reaching your bookings. Please try again.
        </p>
        <Button onClick={() => refetch()} className="gap-2 rounded-full">
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      </section>
    );
  }

  const todayIso = toIsoDate(new Date());
  const { upcoming, past } = splitAppointments(appointments ?? [], {
    date: todayIso,
    minutes: new Date().getHours() * 60 + new Date().getMinutes(),
  });

  const tabs = [
    { id: "upcoming", label: "Upcoming", items: upcoming },
    { id: "past", label: "Past", items: past },
  ];
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  function handleTabKeyDown(event) {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    let nextId = null;
    if (event.key === "ArrowRight") {
      nextId = tabs[(index + 1) % tabs.length].id;
    } else if (event.key === "ArrowLeft") {
      nextId = tabs[(index - 1 + tabs.length) % tabs.length].id;
    }
    if (nextId) {
      event.preventDefault();
      setActiveTab(nextId);
      tablistRef.current
        ?.querySelector(`#appointments-tab-${nextId}`)
        ?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="My appointments"
        onKeyDown={handleTabKeyDown}
        className="flex rounded-full bg-surface-container-high p-1"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              id={`appointments-tab-${tab.id}`}
              role="tab"
              aria-selected={selected}
              aria-controls={`appointments-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-11 flex-1 rounded-full px-3 py-1.5 text-label-md transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                selected
                  ? "bg-surface-container-lowest font-semibold text-primary shadow-level-1"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label} ({tab.items.length})
            </button>
          );
        })}
      </div>

      <div
        id={`appointments-panel-${active.id}`}
        role="tabpanel"
        aria-label={`${active.label} appointments`}
      >
        {active.items.length === 0 ? (
          <EmptyTab label={active.label} />
        ) : (
          <ul className="flex flex-col gap-space-md" aria-label={active.label}>
            {active.items.map((appointment) => (
              <li key={appointment._id}>
                <AppointmentCard
                  appointment={appointment}
                  doctor={doctorsById[appointment.doctorId]}
                  relativeDay={relativeDay(
                    appointment.appointmentDate,
                    todayIso,
                  )}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Tab empty state (design: centred card with icon + CTA). */
function EmptyTab({ label }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface-container-lowest p-space-xl text-center shadow-level-1">
      <div
        aria-hidden="true"
        className="mb-3 flex size-12 items-center justify-center rounded-full bg-surface-container-low text-primary"
      >
        <Clock3 className="size-6" />
      </div>
      <h2 className="text-headline-sm text-on-surface">
        No {label.toLowerCase()} appointments
      </h2>
      <p className="mt-1 max-w-sm text-body-sm text-on-surface-variant">
        {label === "Upcoming"
          ? "You have nothing booked right now. Find a specialist and pick a slot that suits you."
          : "Visits you have attended will appear here."}
      </p>
      {label === "Upcoming" && (
        <Button asChild className="mt-space-md rounded-full">
          <Link href="/doctors" className="gap-2">
            <Search aria-hidden="true" className="size-4" />
            Find a doctor
          </Link>
        </Button>
      )}
    </div>
  );
}

/** Skeleton matching the final layout (tabs + two cards). */
function BrowserSkeleton() {
  return (
    <div role="status" aria-label="Loading your appointments" className="flex flex-col gap-space-md">
      <div className="flex rounded-full bg-surface-container-high p-1">
        <div className="h-11 flex-1 animate-pulse rounded-full bg-surface-container-lowest" />
        <div className="h-11 flex-1 animate-pulse rounded-full bg-surface-container-lowest/60" />
      </div>
      {[0, 1].map((index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-44 animate-pulse rounded-xl bg-surface-container-lowest shadow-level-1"
        />
      ))}
    </div>
  );
}
