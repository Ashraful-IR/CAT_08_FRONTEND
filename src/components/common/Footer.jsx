import Link from "next/link";
import { Phone } from "lucide-react";
import { Logo } from "./Logo";

/**
 * Footer per design/docappoint_doctor_profile_booking_flow → <footer> (the
 * only screen that ships one; earlier "no footer in the design" note was
 * corrected in DECISIONS). Content trimmed to what is real: the emergency
 * notice strip, branding + blurb, a Patients link column (routes that exist),
 * and the legal row. The design's HIPAA/SSL/Medical-Board chips and the
 * Specialties/Clinical-Care columns are omitted — no backing data or routes
 * (no-fabricated-content rule, PRD → Out of scope).
 */
export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      {/* Emergency notice strip (design: error-container band above the grid). */}
      <div className="bg-error-container/40 py-3 px-margin-mobile md:px-margin">
        <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2 text-center">
          <p className="text-label-md text-on-error-container">
            <span className="font-bold">Medical Emergency Notice:</span> If you
            are experiencing a medical emergency, please call{" "}
            <span className="font-bold underline">999</span> immediately or
            proceed to the nearest emergency centre.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-margin-mobile py-space-lg md:px-margin">
        <div className="flex flex-col gap-space-lg md:flex-row md:items-start md:justify-between">
          {/* Branding (design: logo + one-line positioning statement). */}
          <div className="flex max-w-sm flex-col gap-space-sm">
            <Logo />
            <p className="text-body-sm text-on-surface-variant">
              Book verified doctors with clear upfront fees — in-person or video
              consultations, reschedule or cancel any time.
            </p>
          </div>

          {/* Patients column (design keeps three columns; only routes that
              exist ship — the rest would be dead links). */}
          <nav aria-label="Patients" className="flex flex-col gap-2.5">
            <h2 className="text-label-lg uppercase tracking-wide text-on-surface">
              Patients
            </h2>
            <ul className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
              <li>
                <Link href="/doctors" className="transition-colors hover:text-on-surface">
                  Find a doctor
                </Link>
              </li>
              <li>
                <Link
                  href="/appointments"
                  className="transition-colors hover:text-on-surface"
                >
                  My appointments
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-on-surface">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-on-surface">
                  Create an account
                </Link>
              </li>
            </ul>
          </nav>

          {/* Emergency contact (design: concierge call block, reduced to the
              real, actionable number line). */}
          <div className="flex flex-col gap-space-sm">
            <h2 className="text-label-lg uppercase tracking-wide text-on-surface">
              Emergency
            </h2>
            <p className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <Phone aria-hidden="true" className="size-4 text-primary" />
              <span className="tabular-nums font-semibold text-on-surface">999</span>
              <span>(National Emergency Service)</span>
            </p>
          </div>
        </div>

        <div className="mt-space-lg flex flex-col items-center justify-between gap-space-sm border-t border-outline-variant pt-space-md text-label-md text-on-surface-variant md:flex-row">
          <p>© {new Date().getFullYear()} DocAppoint. All rights reserved.</p>
          <p>Care you can trust — booked in minutes.</p>
        </div>
      </div>
    </footer>
  );
}
