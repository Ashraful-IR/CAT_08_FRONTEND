import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDoctors } from "@/features/doctors/api";
import { AppointmentsBrowser } from "@/features/appointments/AppointmentsBrowser";
import { AppointmentsGreeting } from "@/features/appointments/AppointmentsGreeting";

/**
 * My appointments (roadmap 4.1; design →
 * docappoint_my_appointments_dashboard). Protected route: middleware already
 * redirected signed-out visitors, and the data itself is fetched client-side
 * (AppointmentsBrowser) so the auth cookie flows.
 *
 * The backend's Appointment rows carry only doctorId + doctorName (D-001), so
 * the public doctors registry is joined here (server-side); an unreachable
 * registry degrades cards to initials + name instead of failing the page.
 * Design sections without backend data are omitted (PRD → Out of scope):
 * confirmation banner with ref codes, patient health profile (blood type,
 * insurance), mini calendar, care-concierge card.
 */

export async function generateMetadata() {
  return {
    title: "My Appointments — DocAppoint",
    description:
      "Track your upcoming consultations and revisit the visits you have attended.",
  };
}

export default async function AppointmentsPage() {
  const doctors = await getDoctors().catch(() => []);
  const doctorsById = Object.fromEntries(
    doctors.map((doctor) => [doctor._id, doctor]),
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-space-lg md:px-margin">
      <header className="flex flex-col gap-space-md sm:flex-row sm:items-center sm:justify-between">
        <AppointmentsGreeting />
        <Button asChild className="self-start rounded-full sm:self-auto">
          <Link href="/doctors" className="gap-2">
            <Plus aria-hidden="true" className="size-4" />
            Book new appointment
          </Link>
        </Button>
      </header>

      <div className="mt-space-lg">
        <AppointmentsBrowser doctorsById={doctorsById} />
      </div>
    </div>
  );
}
