import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReview } from "./api";

/** Centralised query keys for the reviews feature (ARCHITECTURE). */
export const reviewKeys = {
  forDoctor: (doctorId) => ["reviews", doctorId],
};

/**
 * POST /reviews (task 4.4). On success the doctor's reviews and rating are
 * stale — refresh them (API_CONTRACT → Reviews: invalidate ['doctor', id],
 * ['doctors'], ['reviews', id]).
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (review) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.forDoctor(review.doctorId),
      });
      queryClient.invalidateQueries({ queryKey: ["doctor", review.doctorId] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
}
