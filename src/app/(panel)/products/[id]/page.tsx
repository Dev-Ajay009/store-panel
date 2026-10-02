import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { ProductImage } from "@/components/product-image";
import { StatusBadge } from "@/components/status-badge";
import { StatusToggle } from "@/components/status-toggle";
import { formatDateTime, formatPrice } from "@/lib/format";
import { can } from "@/lib/permissions";
import { requireUser } from "@/server/auth";
import { getProduct } from "@/server/products";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).id);
  return { title: product?.name ?? "Product not found" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [user, product] = await Promise.all([requireUser(), getProduct(id)]);

  if (!product) notFound();

  return (
    <div className="space-y-5">
      <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
        ← Back to products
      </Link>

      <article className="card overflow-hidden md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-[4/3] w-full text-5xl md:h-full" />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">{product.category.name}</p>
              <h1 className="text-2xl font-semibold">{product.name}</h1>
            </div>
            <StatusBadge status={product.status} />
          </div>

          <p className="whitespace-pre-line text-gray-700">{product.description}</p>

          <dl className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-sm">
            <div>
              <dt className="text-gray-500">Price</dt>
              <dd className="mt-0.5 text-lg font-semibold">{formatPrice(product.priceCents)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Stock</dt>
              <dd className={`mt-0.5 text-lg font-semibold ${product.stock === 0 ? "text-red-600" : ""}`}>
                {product.stock === 0 ? "Out of stock" : product.stock}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="mt-0.5">{formatDateTime(product.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last updated</dt>
              <dd className="mt-0.5">{formatDateTime(product.updatedAt)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-start gap-2 border-t border-gray-100 pt-5">
            {can(user.role, "product:edit") && (
              <Link href={`/products/${product.id}/edit`} className="btn btn-primary">
                Edit
              </Link>
            )}
            {can(user.role, "product:status") && <StatusToggle id={product.id} status={product.status} />}
            {can(user.role, "product:delete") && <DeleteButton id={product.id} name={product.name} redirectToList />}
          </div>
        </div>
      </article>
    </div>
  );
}
