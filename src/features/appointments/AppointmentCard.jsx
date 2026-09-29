import Link from "next/link";
import { CalendarDays, Clock, Stethoscope, User } from "lucide-react";
import { formatBDT } from "@/lib/format";
import { Avatar } from "@/components/common/Avatar";

/**
 * One appointment in the /appointments list (design →
 * docappoint_my_appointments_dashboard appointment card). Backend
 * Appointment has no photo/specialty, so the page joins the doctor record in
 * (D-001); a missing join degrades to an initials avatar and no specialty.
 *
 * @param {{
 *   appointment: import("@/lib/api/types").Appointment,
 *   doctor?: import("@/lib/api/types").Doctor,
 *   relativeDay: string,
 * }} props
 */
export function AppointmentCard({ appointment, doctor, relativeDay }) {
  const specialty = doctor?.specialty ?? null;
  const upcoming = !relativeDay.includes("Ago");

  return (
    <article className="flex flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-level-1">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <Avatar
            name={doctor?.name ?? appointment.doctorName}
            src={doctor?.photoURL ?? null}
          />
          <div>
            <Link
              href={`/doctors/${appointment.doctorId}`}
              className="text-headline-sm text-on-surface transition-colors hover:text-primary"
            >
              {appointment.doctorName}
            </Link>
            {specialty && (
              <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                {specialty}
              </p>
            )}
          </div>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-label-sm font-semibold ${
            upcoming
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-surface-container text-on-surface-variant"
          }`}
        >
          {relativeDay}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-space-sm rounded-lg bg-surface-container-low p-2.5 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" className="size-4.5 text-primary" />
          <div>
            <p className="text-label-sm text-on-surface-variant">Date &amp; Time</p>
            <p className="text-label-md font-semibold text-on-surface tabular-nums">
              {appointment.appointmentDate} · {appointment.appointmentTime}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stethoscope aria-hidden="true" className="size-4.5 text-primary" />
          <div>
            <p className="text-label-sm text-on-surface-variant">Visit Fee</p>
            <p className="text-label-md font-semibold text-on-surface tabular-nums">
              {formatBDT(appointment.fee)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <User aria-hidden="true" className="size-3.5 text-primary" />
          {appointment.patientName}
        </span>
        <span>{appointment.gender}</span>
        <span className="tabular-nums">{appointment.phone}</span>
        <span className="flex items-center gap-1.5">
          <Clock aria-hidden="true" className="size-3.5 text-primary" />
          Booked {appointment.createdAt.slice(0, 10)}
        </span>
      </div>
    </article>
  );
}
