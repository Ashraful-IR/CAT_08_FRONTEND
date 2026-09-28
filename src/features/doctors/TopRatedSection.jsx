import { ArrowRight } from "lucide-react";
import { DoctorCard } from "./DoctorCard";

/**
 * Server component — pure presentation over data fetched in the page
 * (design → docappoint_home_doctor_discovery → Top Rated Doctors).
 * The design's "100% Board Certified" pill and fabricated review counts are
 * omitted (DECISIONS → Log).
 *
 * @param {{ doctors: Array<import("@/lib/api/types").Doctor> }} props
 */
export function TopRatedSection({ doctors }) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-margin-mobile py-space-xl md:px-margin">
      <div className="mb-space-lg flex flex-col justify-between gap-space-sm sm:flex-row sm:items-end">
        <div>
          <h2 className="text-headline-lg text-on-surface">Top Rated Doctors</h2>
          <p className="text-body-md text-on-surface-variant">
            Highly rated professionals trusted by our patients.
          </p>
        </div>
        <a
          href="/doctors"
          className="group inline-flex items-center gap-1.5 text-label-lg font-semibold text-primary transition-colors hover:text-primary-container"
        >
          View All Doctors
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </a>
      </div>

      {doctors.length === 0 ? (
        <p className="rounded-xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">
          No doctors to show yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </section>
  );
}
