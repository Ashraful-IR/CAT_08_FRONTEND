"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { filtersToSearchParams, parseFilters } from "./url-state";

const RATING_OPTIONS = [
  { value: "any", label: "Any rating" },
  { value: "4.5", label: "4.5 & above" },
  { value: "4.8", label: "4.8 & above" },
];

/**
 * Filter panel for /doctors (design → docappoint_doctor_search_filters →
 * "Refine Doctors"). Inline in a desktop sidebar; the same panel renders
 * inside a Sheet behind a "Filters" button on mobile. Every change pushes a
 * new URL (DECISIONS D-002) — the URL is the single source of truth, so no
 * local state can drift.
 *
 * Availability, language, and location filters are omitted (DECISIONS D-001 —
 * the fields do not exist on the backend).
 *
 * @param {{ specialties: string[], className?: string }} props
 */
export function FilterSidebar({ specialties, className }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseFilters(searchParams);
  const selected = filters.specialty ?? [];

  /** Replaces the URL with the given filters merged over the current ones. */
  function apply(updates) {
    const next = { ...filters, ...updates };
    const query = filtersToSearchParams(next).toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function toggleSpecialty(specialty, checked) {
    const next = checked
      ? [...selected, specialty]
      : selected.filter((item) => item !== specialty);
    apply({ specialty: next });
  }

  function handleFee(part) {
    return (event) => {
      const raw = event.target.value.trim();
      apply({ [part]: raw === "" || Number.isNaN(Number(raw)) ? undefined : Number(raw) });
    };
  }

  function handleRating(value) {
    apply({ minRating: value === "any" ? undefined : Number(value) });
  }

  function resetAll() {
    router.push(pathname);
  }

  const activeCount =
    selected.length +
    (filters.minFee !== undefined ? 1 : 0) +
    (filters.maxFee !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0);

  const panel = (
    <div className="flex flex-col gap-space-lg">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-label-lg text-on-surface">Medical Specialty</legend>
        {specialties.map((specialty) => (
          <label
            key={specialty}
            className="flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-surface-container-low"
          >
            <span className="flex items-center gap-2.5">
              <Checkbox
                checked={selected.includes(specialty)}
                onCheckedChange={(checked) => toggleSpecialty(specialty, checked === true)}
              />
              <span className="text-body-sm font-medium text-on-surface">
                {specialty}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label-lg text-on-surface">Consultation Fee</legend>
        <div className="flex items-center gap-2">
          <div>
            <label htmlFor="fee-min" className="sr-only">
              Min fee (৳)
            </label>
            <Input
              id="fee-min"
              type="number"
              min="0"
              placeholder="Min"
              defaultValue={filters.minFee}
              onBlur={handleFee("minFee")}
              className="bg-surface-container-low"
            />
          </div>
          <span aria-hidden="true" className="text-on-surface-variant">–</span>
          <div>
            <label htmlFor="fee-max" className="sr-only">
              Max fee (৳)
            </label>
            <Input
              id="fee-max"
              type="number"
              min="0"
              placeholder="Max"
              defaultValue={filters.maxFee}
              onBlur={handleFee("maxFee")}
              className="bg-surface-container-low"
            />
          </div>
          <span className="text-label-sm text-on-surface-variant">BDT</span>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-label-lg text-on-surface">Patient Rating</legend>
        <RadioGroup
          value={filters.minRating !== undefined ? String(filters.minRating) : "any"}
          onValueChange={handleRating}
        >
          {RATING_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-surface-container-low"
            >
              <RadioGroupItem value={value} />
              <Star aria-hidden="true" className="size-4 fill-primary text-primary" />
              <span className="text-label-md text-on-surface">{label}</span>
            </label>
          ))}
        </RadioGroup>
      </fieldset>

      <Button variant="ghost" onClick={resetAll} className="self-start text-primary">
        Reset All
      </Button>
    </div>
  );

  return (
    <div className={className}>
      {/* Desktop panel */}
      <aside className="hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-level-1 lg:block">
        <div className="flex items-center justify-between pb-space-md">
          <h2 className="text-headline-sm text-on-surface">Refine Doctors</h2>
        </div>
        {panel}
      </aside>

      {/* Mobile sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-full">
              <Filter aria-hidden="true" className="size-4" />
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="gap-0 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Refine Doctors</SheetTitle>
              <SheetDescription>
                Narrow the list by specialty, fee, and rating.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 p-space-md">{panel}</div>
            <SheetFooter>
              <Button variant="ghost" onClick={resetAll} className="flex-1">
                Reset All
              </Button>
              <SheetClose asChild>
                <Button className="flex-1">Show results</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
