import Image from "next/image";
import { Star } from "lucide-react";
import { formatDate, formatRating } from "@/lib/format";

/**
 * Reviews list for the doctor profile (API_CONTRACT → GET /reviews/:doctorId).
 * Ratings render with one decimal (DESIGN_SYSTEM → Content rules); dates use
 * YYYY-MM-DD (DECISIONS D-006).
 *
 * @param {{ reviews: Array<import("@/lib/api/types").Review> }} props
 */
export function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl bg-surface-container-low p-space-md text-body-md text-on-surface-variant">
        No reviews yet. Be the first to share your experience after your visit.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-space-md">
      {reviews.map((review) => {
        const initials =
          review.userPhotoURL === ""
            ? review.userName
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()
            : null;

        return (
          <li
            key={review._id}
            className="rounded-xl bg-surface-container-lowest p-space-md shadow-level-1"
          >
            <div className="flex items-start gap-space-md">
              {review.userPhotoURL ? (
                <Image
                  src={review.userPhotoURL}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-lg text-on-primary-container"
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-label-lg text-on-surface">
                    {review.userName}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 text-label-sm font-bold text-on-surface">
                    <Star
                      aria-hidden="true"
                      className="size-3.5 fill-primary text-primary"
                    />
                    {formatRating(review.rating)}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant tabular-nums">
                  {formatDate(review.createdAt)}
                </p>
                <p className="mt-1 text-body-sm text-on-surface">
                  {review.comment}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
