"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCancelAppointment } from "./hooks";
import { getErrorMessage } from "@/lib/api/errors";

/**
 * Cancel confirmation (roadmap 4.3; design →
 * docappoint_my_appointments_dashboard → cancel modal). Cancel = delete
 * (D-008): the destructive action only fires after the user confirms; a
 * backing-out closes the dialog without any request. Backend failures render
 * inline and keep the dialog open.
 *
 * @param {{
 *   appointment: import("@/lib/api/types").Appointment,
 *   trigger: React.ReactElement,
 * }} props
 */
export function CancelDialog({ appointment, trigger }) {
  const [open, setOpen] = useState(false);
  const cancel = useCancelAppointment();

  async function handleConfirm() {
    try {
      await cancel.mutateAsync(appointment._id);
      toast.success("Appointment cancelled", {
        description: "The slot is free for other patients again.",
      });
      setOpen(false);
    } catch {
      // Failure renders inline below; the dialog stays open for a retry.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          cancel.reset();
        }
      }}
    >
      {trigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert aria-hidden="true" className="size-5 text-error" />
            Cancel this appointment?
          </DialogTitle>
          <DialogDescription>
            This permanently deletes your booking. The slot will be open to
            other patients again.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-surface-container-low p-space-md text-body-sm text-on-surface">
          <p className="font-semibold">{appointment.doctorName}</p>
          <p className="mt-0.5 tabular-nums text-on-surface-variant">
            {appointment.appointmentDate} · {appointment.appointmentTime}
          </p>
        </div>

        {cancel.isError && (
          <p role="alert" className="text-body-sm text-error">
            {getErrorMessage(cancel.error)}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => setOpen(false)}
          >
            Keep appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={cancel.isPending}
            className="rounded-full"
          >
            {cancel.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Cancelling…
              </>
            ) : (
              "Yes, cancel it"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
