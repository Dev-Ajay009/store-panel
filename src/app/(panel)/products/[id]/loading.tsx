export default function Loading() {
  return (
    <div className="space-y-5" aria-busy="true">
      <span className="sr-only">Loading product…</span>
      <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      <div className="card animate-pulse overflow-hidden md:grid md:grid-cols-[2fr_3fr]">
        <div className="aspect-[4/3] bg-gray-200" />
        <div className="space-y-4 p-6">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-6 w-2/3 rounded bg-gray-200" />
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-10 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
