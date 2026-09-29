"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "./hooks";
import { reviewSchema } from "./schemas";

/**
 * Review dialog for past appointments (roadmap 4.4; design →
 * docappoint_my_appointments_dashboard → review modal). The rating is a
 * radio group of five star options (keyboard/screen-reader friendly); the
 * backend only accepts reviews against the user's own bookings and one per
 * appointment (documented 400s render inline).
 *
 * @param {{
 *   appointment: import("@/lib/api/types").Appointment,
 *   trigger: React.ReactElement,
 * }} props
 */
export function ReviewDialog({ appointment, trigger }) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    mode: "onTouched",
    defaultValues: { rating: undefined, comment: "" },
  });

  const createReview = useCreateReview();
  const errors = form.formState.errors;

  async function onSubmit(values) {
    try {
      await createReview.mutateAsync({
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        rating: values.rating,
        comment: values.comment,
      });
      toast.success("Review published", {
        description: `Thank you for reviewing ${appointment.doctorName}.`,
      });
      setOpen(false);
      form.reset();
    } catch {
      // Documented 400s render inline below.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          form.reset();
          createReview.reset();
        }
      }}
    >
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {appointment.doctorName}</DialogTitle>
          <DialogDescription>            Your visit on {appointment.appointmentDate} · {" "}
            {appointment.appointmentTime}. Reviews are shown on the
            doctor&apos;s profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Controller
            control={form.control}
            name="rating"
            render={({ field }) => (
              <Field data-invalid={errors.rating ? true : undefined}>
                <FieldLabel>Overall rating</FieldLabel>
                <div
                  role="radiogroup"
                  aria-label="Overall rating"
                  className="flex items-center gap-1"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={field.value === value}
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      onClick={() => field.onChange(value)}
                      className="rounded-full p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <Star
                        aria-hidden="true"
                        className={`size-7 transition-colors ${
                          value <= (field.value ?? 0)
                            ? "fill-primary text-primary"
                            : "text-outline-variant"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <FieldError>{errors.rating.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Field className="mt-space-md" data-invalid={errors.comment ? true : undefined}>
            <FieldLabel htmlFor="review-comment">Your review</FieldLabel>
            <Textarea
              id="review-comment"
              rows={3}
              placeholder="Share your experience — waiting time, clarity of explanations, care quality…"
              aria-invalid={!!errors.comment}
              aria-describedby={errors.comment ? "review-comment-error" : undefined}
              {...form.register("comment")}
            />
            {errors.comment && (
              <FieldError id="review-comment-error">
                {errors.comment.message}
              </FieldError>
            )}
          </Field>

          {createReview.isError && (
            <p role="alert" className="mt-space-md text-body-sm text-error">
              {createReview.error.message}
            </p>
          )}

          <DialogFooter className="mt-space-md">
            <Button
              type="submit"
              disabled={createReview.isPending}
              className="rounded-full"
            >
              {createReview.isPending ? (
                <>
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                "Submit review"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
