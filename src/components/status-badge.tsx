type ProductStatus = "ACTIVE" | "INACTIVE";

export function StatusBadge({ status }: { status: ProductStatus }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
        active
          ? "bg-green-50 text-green-700 ring-green-600/20"
          : "bg-gray-100 text-gray-600 ring-gray-500/20"
      }`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${active ? "bg-green-600" : "bg-gray-400"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
