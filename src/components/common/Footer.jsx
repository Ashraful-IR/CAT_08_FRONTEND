import Link from "next/link";
import { Logo } from "./Logo";

/**
 * Minimal footer — the design has no footer screen, so this is derived from
 * the design tokens (same rule as DECISIONS D-007 for missing screens).
 */
export function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface">
      <div className="max-w-[1280px] mx-auto px-margin py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <Logo />
        <p className="text-label-md text-on-surface-variant text-center">
          © {new Date().getFullYear()} DocAppoint · Book verified doctors with clear upfront
          fees.
        </p>
        <nav aria-label="Footer" className="flex items-center gap-space-md">
          <Link href="/doctors" className="text-label-md text-on-surface-variant hover:text-on-surface">
            Doctors
          </Link>
          <Link
            href="/appointments"
            className="text-label-md text-on-surface-variant hover:text-on-surface"
          >
            Appointments
          </Link>
        </nav>
      </div>
    </footer>
  );
}
