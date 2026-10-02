export function ProductsSkeleton() {
  return (
    <div className="card divide-y divide-gray-100" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading products…</span>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 p-4">
          <div className="size-12 rounded-md bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="h-3 w-1/5 rounded bg-gray-100" />
          </div>
          <div className="hidden h-3 w-16 rounded bg-gray-200 sm:block" />
        </div>
      ))}
    </div>
  );
}
