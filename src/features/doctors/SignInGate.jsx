"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";

/**
 * Proactive sign-in gate for booking (task 3.4; SECURITY_AND_AUTH → Route
 * protection): a signed-out visitor sees an explanation with the fee instead
 * of a form they can only fail at the very end. Both links carry the current
 * path as a validated `?next=` target so signing in returns here (the open
 * redirect guard lives in features/auth/next-path.js).
 *
 * The 401-driven redirect (Providers → setUnauthorizedHandler) remains as the
 * safety net for sessions that expire mid-flow.
 *
 * @param {{ doctor: import("@/lib/api/types").Doctor }} props
 */
export function SignInGate({ doctor }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The booking page itself never arrives with ?next=; chaining one onto the
  // return path would be confusing, so only the path (+ its own query) is used.
  const returnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const next = encodeURIComponent(returnTo);

  return (
    <div className="flex flex-col items-center rounded-2xl bg-surface-container-lowest p-space-lg text-center shadow-level-1">
      <div
        aria-hidden="true"
        className="flex size-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container"
      >
        <Lock className="size-5" />
      </div>
      <h2 className="mt-space-md text-headline-sm text-on-surface">
        Sign in to book
      </h2>
      <p className="mt-1 max-w-xs text-body-sm text-on-surface-variant">
        Create a free account or sign in to confirm your appointment with{" "}
        {doctor.name}.
      </p>

      <p className="mt-space-md flex w-full items-center justify-between rounded-xl bg-surface-container-low px-space-md py-space-sm">
        <span className="text-label-md text-on-surface-variant">
          Consultation Fee
        </span>
        <span className="text-headline-sm font-bold text-primary tabular-nums">
          {formatBDT(doctor.fee)}
        </span>
      </p>

      <Button asChild className="mt-space-lg w-full rounded-full">
        <Link href={`/login?next=${next}`}>Sign in</Link>
      </Button>
      <p className="mt-space-sm text-body-sm text-on-surface-variant">
        New to DocAppoint?{" "}
        <Link
          href={`/register?next=${next}`}
          className="text-label-lg font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
