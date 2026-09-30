import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";
import { formatBDT, formatRating } from "@/lib/format";

/**
 * Shared doctor card (design → docappoint_home_doctor_discovery → doctorGrid).
 * Stretched-link pattern: the name is the single link, its hit area covers
 * the card (no nested-link a11y issues). Name/specialty/rating/fee are the
 * fields confirmed to exist (DECISIONS D-001); design tags, "Next Available"
 * and review counts are omitted (no backend fields).
 *
 * @param {{ doctor: import("@/lib/api/types").Doctor }} props
 */
export function DoctorCard({ doctor }) {
  // API names include honorifics ("Dr. Fatema Begum") — skip dotted words
  // like "Dr." so the avatar shows the person's initials.
  const initials = doctor.name
    .split(" ")
    .filter((word) => word.length > 0 && !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <article className="relative flex h-full flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-md shadow-level-1 transition-shadow hover:shadow-level-2">
      <div className="flex items-start gap-space-sm">
        <div className="relative shrink-0">
          {doctor.photoURL ? (
            <SafeImage
              src={doctor.photoURL}
              alt={doctor.name}
              width={64}
              height={64}
              className="size-16 rounded-xl object-cover"
              fallback={
                <div
                  aria-hidden="true"
                  className="flex size-16 items-center justify-center rounded-xl bg-primary-container text-headline-sm text-on-primary-container"
                >
                  {initials}
                </div>
              }
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-16 items-center justify-center rounded-xl bg-primary-container text-headline-sm text-on-primary-container"
            >
              {initials}
            </div>
          )}
          <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-sm">
            <BadgeCheck
              role="img"
              aria-label={`${doctor.name} verified`}
              className="size-3.5"
            />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          {/* h2: directly under the section h1/h2 in every usage context. */}
          <h2 className="truncate text-headline-sm text-on-surface">
            <Link
              href={`/doctors/${doctor._id}`}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {doctor.name}
            </Link>
          </h2>
          <p className="text-label-sm font-semibold text-primary">
            {doctor.specialty}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <Star
              aria-hidden="true"
              className="size-4 fill-primary text-primary"
            />
            <span className="text-label-sm font-bold text-on-surface">
              {formatRating(doctor.rating)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-space-md flex items-end justify-between border-t border-outline-variant pt-space-md">
        <span className="text-label-sm text-on-surface-variant">
          Consultation Fee
        </span>
        <span className="text-label-lg font-bold text-primary tabular-nums">
          {formatBDT(doctor.fee)}
        </span>
      </div>
    </article>
  );
}
