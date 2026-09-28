/**
 * Route-level loading state for /doctors (docs/TDD → untested error/empty/
 * loading states are a defect; design → docappoint_doctor_search_filters →
 * "view-state-loading"). Mirrors the final layout: search banner card,
 * refine sidebar, count card, and the results grid.
 */
export default function DoctorsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-margin-mobile py-space-lg md:px-margin">
      <div aria-busy="true" aria-label="Loading doctors">
        <div
          aria-hidden
          className="animate-pulse rounded-xl bg-surface-container-lowest p-space-md shadow-level-1"
        >
          <div className="h-12 rounded-full bg-surface-container-low" />
        </div>

        <div className="mt-space-md grid grid-cols-1 gap-space-md lg:grid-cols-12 lg:gap-space-lg">
          <div className="hidden lg:col-span-4 lg:block">
            <div
              aria-hidden
              className="h-96 animate-pulse rounded-xl bg-surface-container-lowest p-space-lg shadow-level-1"
            >
              <div className="h-6 w-1/2 rounded bg-surface-container-high" />
              <div className="mt-space-md space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 rounded-lg bg-surface-container-low" />
                ))}
              </div>
            </div>
          </div>

          <section
            aria-label="Doctor results"
            className="flex flex-col gap-space-md lg:col-span-8"
          >
            <div
              aria-hidden
              className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-level-1"
            >
              <div className="space-y-2">
                <div className="h-6 w-40 rounded bg-surface-container-high" />
                <div className="h-4 w-56 rounded bg-surface-container-low" />
              </div>
              <div className="h-10 w-36 rounded-lg bg-surface-container-low" />
            </div>

            <div
              aria-hidden
              className="grid grid-cols-1 gap-space-lg md:grid-cols-2"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-surface-container-lowest shadow-level-1"
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
