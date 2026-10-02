import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductsSkeleton } from "@/components/products-skeleton";
import { ProductsToolbar } from "@/components/products-toolbar";
import { can } from "@/lib/permissions";
import { parseProductQuery, type SearchParams } from "@/lib/product-query";
import { requireUser } from "@/server/auth";
import { listCategories } from "@/server/products";
import { ProductResults } from "./product-results";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const [user, params, categories] = await Promise.all([requireUser(), searchParams, listCategories()]);
  const query = parseProductQuery(params);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        {can(user.role, "product:create") && (
          <Link href="/products/new" className="btn btn-primary">
            New product
          </Link>
        )}
      </div>

      <ProductsToolbar query={query} categories={categories} />

      {/* Keyed on the query so the skeleton shows while a new page of results loads */}
      <Suspense key={JSON.stringify(query)} fallback={<ProductsSkeleton />}>
        <ProductResults query={query} canDelete={can(user.role, "product:delete")} />
      </Suspense>
    </div>
  );
}
