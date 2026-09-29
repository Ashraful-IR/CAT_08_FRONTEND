"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SlotPicker } from "@/features/doctors/SlotPicker";
import { useRescheduleAppointment } from "./hooks";
import { getErrorMessage } from "@/lib/api/errors";

/**
 * Reschedule dialog (roadmap 4.2; design →
 * docappoint_my_appointments_dashboard → Reschedule). Reuses the profile's
 * SlotPicker so the same slot grid, booked-slot greying and keyboard
 * behaviour apply; the current slot is preselected and the save stays
 * disabled until the user actually changes it. A 409 (slot taken meanwhile)
 * renders inline and keeps the dialog open.
 *
 * @param {{
 *   appointment: import("@/lib/api/types").Appointment,
 *   doctorsById?: Record<string, import("@/lib/api/types").Doctor>,
 *   trigger: React.ReactElement,
 * }} props
 */
export function RescheduleDialog({ appointment, doctorsById = {}, trigger }) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState({
    date: appointment.appointmentDate,
    time: appointment.appointmentTime,
  });

  const reschedule = useRescheduleAppointment();
  const changed =
    slot.date !== appointment.appointmentDate ||
    slot.time !== appointment.appointmentTime;

  async function handleSave() {
    try {
      await reschedule.mutateAsync({
        id: appointment._id,
        appointmentDate: slot.date,
        appointmentTime: slot.time,
      });
      toast.success("Appointment rescheduled", {
        description: `${slot.date} · ${slot.time}`,
      });
      setOpen(false);
    } catch {
      // 409 and friends render inline below via reschedule.error.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSlot({
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
          });
          reschedule.reset();
        }
      }}
    >
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule appointment</DialogTitle>
          <DialogDescription>
            {appointment.doctorName} — currently {appointment.appointmentDate} ·{" "}
            {appointment.appointmentTime}. Pick a new slot below.
          </DialogDescription>
        </DialogHeader>

        <SlotPicker
          bookedSlots={[]}
          selected={slot}
          onSelect={setSlot}
        />

        {reschedule.isError && (
          <p role="alert" className="text-body-sm text-error">
            {getErrorMessage(reschedule.error)}
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!changed || reschedule.isPending}
            className="rounded-full"
          >
            {reschedule.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save new time"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
