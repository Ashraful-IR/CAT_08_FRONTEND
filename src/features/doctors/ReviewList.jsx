import { Star } from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";
import { formatDate, formatRating } from "@/lib/format";

/** Renders five 16px stars, `filled` of them solid (design: star rows). */
function StarRow({ rating, ariaLabel }) {
  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `Rated ${formatRating(rating)} out of 5`}
      className="flex items-center gap-0.5 text-primary"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`size-4 ${star <= rating ? "fill-primary" : "fill-transparent text-outline-variant"}`}
        />
      ))}
    </div>
  );
}

/**
 * Reviews section for the doctor profile (API_CONTRACT → GET
 * /reviews/:doctorId; design → docappoint_doctor_profile_booking_flow →
 * "Verified Patient Experiences"): average summary box with a real
 * distribution computed from the reviews, then per-review cards with stars
 * and a "Verified patient" chip (the backend only accepts reviews against a
 * booking, API_CONTRACT → POST /reviews).
 *
 * The doctor's overall rating is passed in from the profile page (it lives on
 * the Doctor object, not the review list).
 *
 * @param {{ reviews: Array<import("@/lib/api/types").Review>, rating?: number }} props
 */
export function ReviewList({ reviews, rating = 0 }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">
        No reviews yet. Be the first to share your experience after your visit.
      </p>
    );
  }

  // Real distribution from the loaded reviews (no fabricated data, D-001).
  const total = reviews.length;
  const counts = new Map();
  for (const review of reviews) {
    counts.set(review.rating, (counts.get(review.rating) ?? 0) + 1);
  }
  const distribution = [5, 4, 3, 2].filter((star) => counts.has(star)).map(
    (star) => ({
      star,
      percent: Math.round((counts.get(star) / total) * 100),
    }),
  );

  return (
    <div className="flex flex-col gap-space-md">
      {/* Summary box (design: metric box with average + star bars). */}
      <div className="grid grid-cols-1 gap-space-md rounded-xl bg-surface-container-low p-space-md sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <span className="text-headline-md font-bold text-on-surface tabular-nums">
            {formatRating(rating)}
          </span>
          <StarRow
            rating={Math.round(rating)}
            ariaLabel={`Doctor rating ${formatRating(rating)} out of 5`}
          />
          <span className="text-label-md text-on-surface-variant">
            {`Based on ${total} patient review${total === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {distribution.map(({ star, percent }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-label-sm text-on-surface-variant">
                {star} star
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-label-sm font-semibold text-on-surface tabular-nums">
                {percent}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-space-md">
        {reviews.map((review) => (
          <li
            key={review._id}
            className="flex flex-col gap-2 rounded-xl bg-surface-container-lowest p-space-md shadow-level-1"
          >
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex min-w-0 items-center gap-2.5">
                {review.userPhotoURL ? (
                  <SafeImage
                    src={review.userPhotoURL}
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-full object-cover"
                    fallback={
                      <div
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-label-md font-bold text-primary"
                      >
                        {initialsOf(review)}
                      </div>
                    }
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-container-highest text-label-md font-bold text-primary"
                  >
                    {initialsOf(review)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-label-lg text-on-surface">
                    {review.userName}
                    <span className="shrink-0 rounded-full bg-secondary-container/40 px-2 py-0.5 text-label-sm font-semibold text-on-secondary-container">
                      Verified patient
                    </span>
                  </p>
                  <p className="text-label-sm text-on-surface-variant tabular-nums">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <StarRow rating={review.rating} />
            <p className="text-body-md text-on-surface-variant">
              {review.comment}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "Rahim Mia" → "RM" (initials avatar, design's circular badge). */
function initialsOf(review) {
  return review.userName
    .split(" ")
    .filter((word) => !word.endsWith("."))
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
