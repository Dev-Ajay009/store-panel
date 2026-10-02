import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { Pagination } from "@/components/pagination";
import { ProductImage } from "@/components/product-image";
import { StatusBadge } from "@/components/status-badge";
import { StatusToggle } from "@/components/status-toggle";
import { formatDate, formatPrice } from "@/lib/format";
import { hasActiveFilters, type ProductQuery } from "@/lib/product-query";
import { listProducts, type ProductWithCategory } from "@/server/products";

type Props = {
  query: ProductQuery;
  canDelete: boolean;
};

export async function ProductResults({ query, canDelete }: Props) {
  const { items, total, page, pageCount } = await listProducts(query);

  if (total === 0) {
    return hasActiveFilters(query) ? (
      <div className="card px-6 py-12 text-center">
        <p className="font-medium">No products found.</p>
        <p className="mt-1 text-sm text-gray-600">Try a different search or remove some filters.</p>
        <Link href="/products" className="btn btn-secondary mt-4">
          Clear filters
        </Link>
      </div>
    ) : (
      <div className="card px-6 py-12 text-center">
        <p className="font-medium">Your store has no products yet.</p>
        <p className="mt-1 text-sm text-gray-600">Add your first product to start selling.</p>
        <Link href="/products/new" className="btn btn-primary mt-4">
          Create first product
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop / tablet */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Products</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Category
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Price
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Created
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.imageUrl} alt={p.name} className="size-10 shrink-0 rounded-md" />
                    <Link href={`/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.priceCents)}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${p.stock === 0 ? "text-red-600" : ""}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3">
                  <RowActions product={p} canDelete={canDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 md:hidden">
        {items.map((p) => (
          <li key={p.id} className="card p-4">
            <div className="flex gap-3">
              <ProductImage src={p.imageUrl} alt={p.name} className="size-16 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/products/${p.id}`} className="truncate font-medium hover:underline">
                    {p.name}
                  </Link>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-gray-600">{p.category.name}</p>
                <dl className="mt-1 flex flex-wrap gap-x-4 text-sm">
                  <div className="flex gap-1">
                    <dt className="text-gray-500">Price</dt>
                    <dd className="font-medium">{formatPrice(p.priceCents)}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="text-gray-500">Stock</dt>
                    <dd className={`font-medium ${p.stock === 0 ? "text-red-600" : ""}`}>{p.stock}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt className="text-gray-500">Added</dt>
                    <dd>{formatDate(p.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <RowActions product={p} canDelete={canDelete} />
            </div>
          </li>
        ))}
      </ul>

      <Pagination query={query} page={page} pageCount={pageCount} total={total} />
    </div>
  );
}

function RowActions({ product, canDelete }: { product: ProductWithCategory; canDelete: boolean }) {
  return (
    <div className="flex flex-wrap items-start gap-2 md:justify-end">
      <Link
        href={`/products/${product.id}/edit`}
        className="btn btn-secondary px-2.5 py-1 text-xs"
        aria-label={`Edit ${product.name}`}
      >
        Edit
      </Link>
      <StatusToggle id={product.id} status={product.status} compact />
      {canDelete && <DeleteButton id={product.id} name={product.name} compact />}
    </div>
  );
}
