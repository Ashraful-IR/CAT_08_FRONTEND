"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorCard } from "./DoctorCard";
import { FilterSidebar } from "./FilterSidebar";
import { SearchBar } from "./SearchBar";
import { filterDoctors } from "./filters";
import { filtersToSearchParams, parseFilters } from "./url-state";

const SORT_OPTIONS = [
  { value: "rating", label: "Rating: high to low" },
  { value: "fee_asc", label: "Fee: low to high" },
  { value: "fee_desc", label: "Fee: high to low" },
  { value: "name", label: "Name: A to Z" },
];

/**
 * Client results area for /doctors. The server page passes the full doctor
 * list once; all filtering/sorting happens client-side from the URL params
 * (DECISIONS D-002), so every change is instant and shareable.
 *
 * @param {{ doctors: Array<import("@/lib/api/types").Doctor> }} props
 */
export function DoctorsBrowser({ doctors }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseFilters(searchParams);
  // Default sort is rating (matches the select's initial option).
  const results = filterDoctors(doctors, { sort: "rating", ...filters });

  function handleSort(sort) {
    const next = { ...filters, sort: sort === "rating" ? undefined : sort };
    const query = filtersToSearchParams(next).toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-col gap-space-md">
      <div className="rounded-xl bg-surface-container-lowest p-space-md shadow-level-1">
        <SearchBar className="flex flex-col gap-space-sm sm:flex-row sm:items-center" />
      </div>

      <div className="flex flex-col gap-space-md lg:grid lg:grid-cols-12 lg:gap-space-lg">
        <FilterSidebar
          specialties={[...new Set(doctors.map((doctor) => doctor.specialty))]}
          className="lg:col-span-4"
        />

        <section
          aria-label="Doctor results"
          className="flex flex-col gap-space-md lg:col-span-8"
        >
          <div className="flex flex-col justify-between gap-space-sm rounded-xl bg-surface-container-lowest p-space-md shadow-level-1 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-headline-sm text-on-surface">
                {results.length} {results.length === 1 ? "doctor" : "doctors"}{" "}
                found
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Showing every verified doctor on DocAppoint.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-label-md whitespace-nowrap text-on-surface-variant"
              >
                Sort by
              </label>
              <select
                id="sort-select"
                value={filters.sort ?? "rating"}
                onChange={(event) => handleSort(event.target.value)}
                className="h-10 cursor-pointer appearance-none rounded-lg bg-surface-container-low px-3 pr-8 text-label-lg font-semibold text-on-surface outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl bg-surface-container-lowest p-space-xl text-center shadow-level-1">
              <div
                aria-hidden="true"
                className="mb-3 flex size-16 items-center justify-center rounded-full bg-surface-container text-primary"
              >
                <SearchX className="size-8" />
              </div>
              <h2 className="text-headline-sm text-on-surface">
                No doctors match your filters
              </h2>
              <p className="mt-1 mb-4 max-w-md text-body-sm text-on-surface-variant">
                Try removing the search text or widening the fee range.
              </p>
              <Button onClick={clearAll} className="rounded-full">
                <SlidersHorizontal aria-hidden="true" className="size-4" />
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2">
              {results.map((doctor) => (
                <DoctorCard key={doctor._id} doctor={doctor} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
