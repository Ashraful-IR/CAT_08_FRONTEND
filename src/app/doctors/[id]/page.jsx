import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Star } from "lucide-react";
import { ApiError } from "@/lib/api/errors";
import { formatBDT, formatRating } from "@/lib/format";
import { getDoctor, getReviews } from "@/features/doctors/api";
import { ReviewList } from "@/features/doctors/ReviewList";

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
 * Doctor profile (design → docappoint_doctor_profile_booking_flow; task 3.1
 * covers details + reviews — the slot picker/form land in 3.2/3.3). Server
 * Component: both doctor and reviews are fetched on the server; reviews are
 * non-critical, so a review failure degrades to the empty state instead of
 * failing the whole profile.
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
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-space-lg md:px-margin">
      <nav aria-label="Breadcrumb">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-label-lg text-primary transition-colors hover:text-primary-container"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          All doctors
        </Link>
      </nav>

      <div className="mt-space-md grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12">
        <div className="flex flex-col gap-space-lg lg:col-span-7 xl:col-span-8">
          <header className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-level-1">
            <div className="flex items-start gap-space-md">
              {doctor.photoURL ? (
                <Image
                  src={doctor.photoURL}
                  alt={doctor.name}
                  width={96}
                  height={96}
                  priority
                  className="size-24 shrink-0 rounded-2xl object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-headline-lg text-on-primary-container"
                >
                  {doctor.name
                    .split(" ")
                    .filter((word) => !word.endsWith("."))
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-headline-lg text-on-surface">
                  {doctor.name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-label-lg font-semibold text-primary">
                  <BadgeCheck aria-hidden="true" className="size-4" />
                  {doctor.specialty}
                </p>
                <p className="mt-2 flex items-center gap-1.5">
                  <Star
                    aria-hidden="true"
                    className="size-4 fill-primary text-primary"
                  />
                  <span className="text-label-lg font-bold text-on-surface tabular-nums">
                    {formatRating(doctor.rating)}
                  </span>
                  <span className="text-label-md text-on-surface-variant">
                    patient rating
                  </span>
                </p>
              </div>
            </div>

            <h2 className="mt-space-md text-headline-sm text-on-surface">
              About
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
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
            <ReviewList reviews={reviews} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:col-span-5 xl:col-span-4">
          <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-level-1">
            <h2 className="text-headline-sm text-on-surface">
              Book a consultation
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {doctor.specialty} · {doctor.name}
            </p>
            <div className="mt-space-md flex items-center justify-between rounded-xl bg-surface-container-low p-space-md">
              <span className="text-label-md text-on-surface-variant">
                Consultation Fee
              </span>
              <span className="text-headline-sm font-bold text-primary tabular-nums">
                {formatBDT(doctor.fee)}
              </span>
            </div>
            <p className="mt-space-md flex items-center gap-2 text-label-md text-on-surface-variant">
              <CalendarDays aria-hidden="true" className="size-4 text-primary" />
              Pick a date and time to see this doctor.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
