"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Stethoscope, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/doctors", label: "Doctors", Icon: Stethoscope },
  { href: "/appointments", label: "Appointments", Icon: CalendarDays },
  { href: "/profile", label: "Profile", Icon: User },
];

/**
 * Mobile bottom tab bar per design/docappoint_mobile_home_doctor_discovery.
 * ≥44px touch targets; active tab highlighted by route match.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.04)] md:hidden"
    >
      <div className="h-16 px-space-sm flex items-center justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-space-xs py-1 transition-colors ${
                active ? "text-primary font-semibold" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Icon aria-hidden className="size-6" />
              <span className="text-label-sm mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
