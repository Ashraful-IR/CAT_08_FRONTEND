import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin py-space-xl text-center">
      <p className="text-label-lg text-primary font-semibold uppercase tracking-wider">
        404
      </p>
      <h1 className="text-display text-on-surface mt-2">Page not found</h1>
      <p className="text-body-lg text-on-surface-variant mt-space-sm max-w-md mx-auto">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-space-lg flex items-center justify-center gap-space-sm">
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          Back to home
        </Link>
        <Link href="/doctors" className={buttonVariants({ variant: "outline" })}>
          Browse doctors
        </Link>
      </div>
    </section>
  );
}
