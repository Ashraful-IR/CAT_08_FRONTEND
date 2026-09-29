/**
 * Route-level loading state for /appointments (docs/TDD → untested loading
 * states are a defect). Mirrors the final layout: greeting + CTA header and
 * the tabs/cards body.
 */
export default function AppointmentsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-space-lg md:px-margin">
      <div aria-busy="true" aria-label="Loading your appointments">
        <div
          aria-hidden="true"
          className="flex flex-col gap-space-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-2">
            <div className="h-8 w-64 rounded bg-surface-container-high" />
            <div className="h-5 w-44 rounded bg-surface-container-low" />
          </div>
          <div className="h-11 w-52 rounded-full bg-surface-container-high" />
        </div>

        <div aria-hidden="true" className="mt-space-lg flex flex-col gap-space-md">
          <div className="flex rounded-full bg-surface-container-high p-1">
            <div className="h-11 flex-1 animate-pulse rounded-full bg-surface-container-lowest" />
            <div className="h-11 flex-1 animate-pulse rounded-full bg-surface-container-lowest/60" />
          </div>
          {[0, 1].map((index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl bg-surface-container-lowest shadow-level-1"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
