"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filtersToSearchParams, parseFilters } from "./url-state";

/**
 * Unified search bar for /doctors (design → docappoint_doctor_search_filters).
 * Submitting rewrites the `q` param, keeping every other filter param.
 *
 * @param {{ className?: string }} props
 */
export function SearchBar({ className }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(event) {
    event.preventDefault();
    const filters = parseFilters(searchParams);
    if (value.trim()) {
      filters.q = value.trim();
    } else {
      delete filters.q;
    }
    const query = filtersToSearchParams(filters).toString();
    router.push(query ? `/doctors?${query}` : "/doctors");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={className}
      aria-label="Search doctors"
    >
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary"
        />
        <label htmlFor="doctors-search" className="sr-only">
          Search
        </label>
        <Input
          id="doctors-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search by doctor name or specialty..."
          className="h-12 rounded-md border-transparent bg-surface-container-low pl-12 text-body-md placeholder:text-on-surface-variant/60"
        />
      </div>
      <Button
        type="submit"
        className="h-12 gap-2 rounded-md px-space-lg text-white"
      >
        Find Care
      </Button>
    </form>
  );
}
