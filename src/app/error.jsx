"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RootError({ error, reset }) {
  useEffect(() => {
    // Next requires reporting; we must never render raw error details.
    console.error(error);
  }, [error]);

  return (
    <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin py-space-xl text-center">
      <h1 className="text-headline-lg text-on-surface">Something went wrong</h1>
      <p className="text-body-lg text-on-surface-variant mt-space-sm max-w-md mx-auto">
        An unexpected error occurred. Please try again — your appointments are safe.
      </p>
      <Button className="mt-space-lg" onClick={() => reset()}>
        Try again
      </Button>
    </section>
  );
}
