export default function RootLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading content"
      className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin py-space-xl"
    >
      <div className="animate-pulse space-y-space-lg" aria-hidden>
        <div className="h-10 w-2/3 rounded-lg bg-surface-container-high" />
        <div className="h-5 w-1/2 rounded bg-surface-container-low" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg pt-space-md">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-surface-container-lowest shadow-level-1"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
