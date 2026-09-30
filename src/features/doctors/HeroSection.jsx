"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Search, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Home hero (design → docappoint_home_doctor_discovery). Client component:
 * owns the search input state and navigates to /doctors with URL params
 * (DECISIONS D-002 — search state lives in the URL, applied client-side).
 * Omissions vs the design (DECISIONS → Log): availability select, decorative
 * right-hand card, fabricated trust-stat row.
 *
 * @param {{ specialties?: string[] }} props - distinct specialties of the
 *   fetched doctors (page passes `specialtiesOf(doctors)`).
 */
export function HeroSection({ specialties = [] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState("all");

  function handleSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    const needle = q.trim();
    if (needle) {
      params.set("q", needle);
    }
    if (specialty !== "all") {
      params.set("specialty", specialty);
    }
    const query = params.toString();
    router.push(query ? `/doctors?${query}` : "/doctors");
  }

  return (
    <section className="mx-auto w-full max-w-[1280px] px-margin-mobile pt-space-md pb-space-xl md:px-margin">
      <div className="grid grid-cols-1 items-center gap-space-xl lg:grid-cols-12">
        <div className="flex flex-col gap-space-md lg:col-span-7">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-container-high px-3 py-1.5">
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-primary"
            />
            <span className="text-label-sm tracking-wide text-on-surface-variant uppercase">
              Verified Medical Professionals • Seamless Care
            </span>
          </div>

          <h1 className="text-display tracking-tight text-on-surface">
            Find the right doctor{" "}
            <span className="block sm:inline">
              <span className="text-primary">for your care.</span>
            </span>
          </h1>

          <p className="max-w-xl text-body-lg text-on-surface-variant">
            Discover trusted, verified physicians and book instant in-person or
            video consultations with clear upfront fees.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-space-sm flex flex-col gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-level-2"
          >
            <div className="flex flex-col items-center gap-space-sm md:grid md:grid-cols-9 md:gap-space-sm">
              <div className="relative w-full flex items-center md:col-span-5">
                <Search
                  aria-hidden="true"
                  className="absolute left-3.5 size-5 text-on-surface-variant"
                />
                <label htmlFor="hero-search" className="sr-only">
                  Search
                </label>
                <Input
                  id="hero-search"
                  type="search"
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Doctor, condition, or hospital..."
                  className="h-12 rounded-lg border-transparent bg-surface-container-low pl-11 text-body-sm placeholder:text-on-surface-variant/70"
                />
              </div>

              <div className="relative w-full flex items-center justify-between md:col-span-4">
                <Stethoscope
                  aria-hidden="true"
                  className="absolute left-3.5 size-5 text-on-surface-variant"
                />
                <label htmlFor="hero-specialty" className="sr-only">
                  Specialty
                </label>
                <select
                  id="hero-specialty"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                  className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-transparent bg-surface-container-low pr-8 pl-11 text-body-sm text-on-surface outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="all">All Specialties</option>
                  {specialties.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 size-4 text-on-surface-variant"
                />
              </div>
            </div>

            <div className="flex items-center justify-center pt-space-xs w-full">
              <Button
                type="submit"
                className="h-12 w-full gap-2 rounded-md px-6 text-white "
              >
                Find a Doctor
                <ArrowRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
