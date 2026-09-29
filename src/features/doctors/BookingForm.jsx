"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { BadgeCheck, CalendarDays, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateAppointment } from "./create-appointment";
import { formatBDT } from "@/lib/format";
import { bookingSchema } from "./schemas";

/**
 * Booking form (task 3.3; design → docappoint_doctor_profile_booking_flow →
 * booking card). React Hook Form + Zod (bookingSchema); the slot is passed
 * in from the picker. 409 renders the backend's message inline and clears
 * the field state; success opens the confirmation dialog (task 3.3).
 *
 * @param {{
 *   doctor: import("@/lib/api/types").Doctor,
 *   slot: { date: string, time: string },
 *   onBooked?: () => void,
 * }} props
 */
export function BookingForm({ doctor, slot, onBooked }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    mode: "onTouched",
    defaultValues: {
      doctorId: doctor._id,
      patientName: "",
      gender: "",
      phone: "",
      appointmentDate: slot.date,
      appointmentTime: slot.time,
    },
  });

  const createAppointment = useCreateAppointment();

  async function onSubmit(values) {
    try {
      await createAppointment.mutateAsync(values);
      setConfirmOpen(true);
      onBooked?.();
    } catch (error) {
      if (error?.status === 409) {
        // Slot was taken while the user was filling the form — surface the
        // backend message inline (API_CONTRACT → Status-code handling) and
        // clear the picker so the user picks again.
        form.setError("appointmentTime", {
          message: error.message ?? "That slot is no longer available",
        });
        onBooked?.("slot-taken");
      } else {
        // Non-409 errors bubble to the global handler (401) or a generic message.
        form.setError("root", {
          message: error?.message ?? "Something went wrong. Please try again.",
        });
      }
    }
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup className="gap-space-md">
        <Field data-invalid={errors.patientName ? true : undefined}>
          <FieldLabel htmlFor="booking-name">Patient name</FieldLabel>
          <Input
            id="booking-name"
            placeholder="Full name of the patient"
            autoComplete="off"
            aria-invalid={!!errors.patientName}
            aria-describedby={errors.patientName ? "booking-name-error" : undefined}
            {...form.register("patientName")}
          />
          {errors.patientName && (
            <FieldError id="booking-name-error">
              {errors.patientName.message}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={errors.gender ? true : undefined}>
          <FieldLabel>Gender</FieldLabel>
          <Controller
            control={form.control}
            name="gender"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                aria-invalid={!!errors.gender}
                className="flex-row gap-4"
              >
                {["Male", "Female", "Other"].map((option) => (
                  <label key={option} className="flex cursor-pointer items-center gap-2">
                    <RadioGroupItem value={option} />
                    <span className="text-label-md text-on-surface">{option}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          {errors.gender && (
            <FieldError>{errors.gender.message}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <Field className="mt-space-md" data-invalid={errors.phone ? true : undefined}>
        <FieldLabel htmlFor="booking-phone">Phone number</FieldLabel>
        <Input
          id="booking-phone"
          type="tel"
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "booking-phone-error" : undefined}
          {...form.register("phone")}
        />
        {errors.phone && (
          <FieldError id="booking-phone-error">{errors.phone.message}</FieldError>
        )}
      </Field>

      <div className="mt-space-md flex items-center justify-between rounded-xl bg-surface-container-low p-space-md">
        <span className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <CalendarDays aria-hidden="true" className="size-4 text-primary" />
          {slot.date}
        </span>
        <span className="flex items-center gap-2 text-label-lg font-bold text-on-surface tabular-nums">
          <Clock aria-hidden="true" className="size-4 text-primary" />
          {slot.time}
        </span>
        <span className="text-label-lg font-bold text-primary tabular-nums">
          {formatBDT(doctor.fee)}
        </span>
      </div>

      {errors.appointmentTime?.message && (
        <p role="alert" className="mt-space-sm text-body-sm text-error">
          {errors.appointmentTime.message}
        </p>
      )}

      {errors.root?.message && (
        <p role="alert" className="mt-space-md text-body-sm text-error">
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={createAppointment.isPending}
        className="mt-space-md w-full rounded-full"
      >
        {createAppointment.isPending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Confirming…
          </>
        ) : (
          "Confirm booking"
        )}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck aria-hidden="true" className="size-5 text-primary" />
              Appointment confirmed
            </DialogTitle>
            <DialogDescription>
              Your visit with {doctor.name} is booked. Show this summary at the
              clinic.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface">
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-on-surface-variant">{doctor.specialty}</p>
            <p className="mt-2 tabular-nums">
              {slot.date} · {slot.time}
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setConfirmOpen(false);
                onBooked?.("done");
              }}
              className="rounded-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
