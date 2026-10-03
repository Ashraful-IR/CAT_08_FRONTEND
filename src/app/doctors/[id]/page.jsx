import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, Star } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { SafeImage } from "@/components/common/SafeImage";
import { formatBDT, formatRating } from "@/lib/format";
import { getDoctor, getReviews } from "@/features/doctors/api";
import { ReviewList } from "@/features/doctors/ReviewList";
import { BookingFlow } from "@/features/doctors/BookingFlow";

/**
 * @param {{ params: Promise<{ id: string }> }} props
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const doctor = await getDoctor(id);
    return { title: doctor.name, description: doctor.description };
  } catch {
    return { title: "Doctor not found" };
  }
}

/**
 * Doctor profile (design → docappoint_doctor_profile_booking_flow; tasks 3.1
 * + 3.4 + fidelity pass). Server Component: doctor and reviews are fetched on
 * the server; reviews are non-critical, so a failure degrades to the empty
 * state instead of failing the page.
 *
 * Sections of the design with no backend data are omitted (PRD → Out of
 * scope, D-001): credentials/affiliations, accepted insurances, languages,
 * hospital/next-opening stats, telehealth fee.
 *
 * @param {{ params: Promise<{ id: string }> }} props
 */
export default async function DoctorProfilePage({ params }) {
  const { id } = await params;

  let doctor;
  try {
    doctor = await getDoctor(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const reviews = await getReviews(id).catch(() => []);

  return (
    <div className="mx-auto w-full max-w-7xl px-margin-mobile py-space-lg md:px-margin">
      {/* Breadcrumb (design: chevron trail with the doctor as current page). */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-label-md text-on-surface-variant">
          <li>
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-outline-variant" />
          </li>
          <li>
            <Link
              href="/doctors"
              className="transition-colors hover:text-primary"
            >
              Doctors
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 text-outline-variant" />
          </li>
          <li aria-current="page" className="font-semibold text-on-surface">
            {doctor.name}
          </li>
        </ol>
      </nav>

      <div className="mt-space-md grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
          {/* Hero card (design: rounded portrait + verified badge, specialty
              chip, rating pill, fee/rating stat strip). */}
          <header className="rounded-2xl bg-surface-container-lowest p-space-md shadow-level-1 sm:p-space-lg">
            <div className="flex flex-col items-start gap-space-md sm:flex-row sm:items-center sm:gap-space-lg">
              <div className="relative shrink-0">
                {doctor.photoURL ? (
                  <SafeImage
                    src={doctor.photoURL}
                    alt={doctor.name}
                    width={112}
                    height={112}
                    priority
                    className="size-24 rounded-full object-cover ring-4 ring-surface-container-highest sm:size-28"
                    fallback={
                      <div
                        aria-hidden="true"
                        className="flex size-24 items-center justify-center rounded-full bg-primary-container text-headline-lg text-on-primary-container ring-4 ring-surface-container-highest sm:size-28"
                      >
                        {initialsOf(doctor.name)}
                      </div>
                    }
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex size-24 items-center justify-center rounded-full bg-primary-container text-headline-lg text-on-primary-container ring-4 ring-surface-container-highest sm:size-28"
                  >
                    {initialsOf(doctor.name)}
                  </div>
                )}
                <span
                  title="Verified medical specialist"
                  className="absolute bottom-0.5 right-0.5 flex size-7 items-center justify-center rounded-full bg-primary text-on-primary shadow-level-1"
                >
                  <BadgeCheck aria-hidden="true" className="size-4" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary-container/20 px-2.5 py-0.5 text-label-sm font-semibold text-on-primary-fixed-variant">
                    {doctor.specialty}
                  </span>
                </p>
                <h1 className="mt-1 text-headline-lg text-on-surface">
                  {doctor.name}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-label-md text-on-surface">
                    <Star
                      aria-hidden="true"
                      className="size-3.5 fill-primary text-primary"
                    />
                    <span className="font-bold tabular-nums">
                      {formatRating(doctor.rating)}
                    </span>
                    <span className="text-on-surface-variant">
                      patient rating
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {/* Stat strip (design: bottom hero strip; only real data shown). */}
            <div className="flex flex-col-3 mt-8 px-5 items-center justify-between ">
              <div className="flex flex-col gap-4 ">
                <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                  Consultation fee
                </span>
                <span className="mt-0.5 text-headline-sm font-bold text-primary tabular-nums">
                  {formatBDT(doctor.fee)}
                  <span className="ml-1 text-body-sm font-normal text-on-surface-variant">
                    / visit
                  </span>
                </span>
              </div>
              <div className="flex flex-col  gap-4">
                <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                  Patient rating
                </span>
                <span className="mt-0.5 flex items-center gap-1 text-headline-sm font-semibold text-on-surface">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="tabular-nums">
                    {formatRating(doctor.rating)}
                  </span>
                  <span className="text-body-sm font-normal text-on-surface-variant">
                    / 5
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-label-sm uppercase tracking-wide text-on-surface-variant">
                  Reviews
                </span>
                <span className="mt-0.5 text-headline-sm font-semibold text-on-surface tabular-nums">
                  {reviews.length}
                </span>
              </div>
            </div>

            <h2 className="mt-space-md px-5 text-headline-sm text-on-surface">
              About
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant px-5">
              {doctor.description}
            </p>
          </header>

          <section aria-labelledby="reviews-heading">
            <h2
              id="reviews-heading"
              className="mb-space-md text-headline-md text-on-surface"
            >
              Reviews
            </h2>
            <ReviewList reviews={reviews} rating={doctor.rating} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
          <BookingFlow doctor={doctor} />
        </aside>
      </div>
    </div>
  );
}

/** "Dr. Fatema Begum" → "FB" for the initials-only portrait fallback. */
function initialsOf(name) {
  return name
    .split(" ")
    .filter((word) => !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
}
