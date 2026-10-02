import { ProductsSkeleton } from "@/components/products-skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
      <ProductsSkeleton />
    </div>
  );
}
