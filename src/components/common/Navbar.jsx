"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/hooks";
import { useUpcomingAppointmentCount } from "@/features/appointments/hooks";
import { splitAppointments } from "@/features/appointments/split";
import { toIsoDate } from "@/lib/datetime";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/appointments", label: "Appointments" },
];

/**
 * Sticky site header per design/docappoint_home_doctor_discovery:
 * announcement banner, logo, pill nav (desktop), search + user area.
 * Auth state comes from useSession(); logged-out users see Sign in / Register.
 */
export function Navbar() {
  const { user, isLoading } = useSession();
  const upcomingCount = useUpcomingAppointmentCount(Boolean(user));

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Announcement banner */}
      <div className="bg-primary text-on-primary text-center py-1.5 px-4 text-label-md">
        <span className="inline-flex items-center gap-2">
          Telehealth &amp; in-clinic bookings now backed by 100% verified physician
          credentials.
        </span>
      </div>

      <div className="h-20 max-w-[1280px] mx-auto px-margin flex items-center justify-between gap-space-lg">
        <div className="flex items-center gap-space-md">
          <Link href="/" aria-label="DocAppoint home" className="flex items-center">
            <Logo />
          </Link>
        </div>

        {/* Desktop pill nav */}
        <nav
          aria-label="Main"
          className="hidden md:flex items-center p-1 rounded-full bg-surface-container-low gap-1"
        >
          {NAV_LINKS.map((link) => {
            const showBadge =
              link.href === "/appointments" &&
              upcomingCount !== null &&
              upcomingCount > 0;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-label={
                  showBadge ? `Appointments, ${upcomingCount} upcoming` : undefined
                }
                className="px-4 py-2 rounded-full text-label-lg text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {link.label}
                {showBadge && (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-flex items-center justify-center size-4 rounded-full bg-error text-on-error align-[1px] text-[10px] leading-none font-bold"
                  >
                    {upcomingCount > 9 ? "9+" : upcomingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-space-md">
          {/* Global search (desktop) — wired to /doctors in task 2.1 */}
          <div className="hidden xl:flex items-center relative w-64">
            <Search aria-hidden className="absolute left-3 size-4 text-on-surface-variant" />
            <input
              type="search"
              name="global-search"
              placeholder="Search doctors, clinics..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-surface-container-lowest text-body-sm text-on-surface placeholder:text-on-surface-variant/60 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {/* Auth area */}
          {isLoading ? (
            <div
              aria-hidden
              data-testid="navbar-auth-skeleton"
              className="h-9 w-24 rounded-full bg-surface-container-high animate-pulse"
            />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
