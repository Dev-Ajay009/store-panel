import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatPrice } from "@/lib/format";
import { requireUser } from "@/server/auth";
import { getDashboardData } from "@/server/products";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [user, data] = await Promise.all([requireUser(), getDashboardData()]);

  const stats = [
    { label: "Total products", value: data.total },
    { label: "Active", value: data.active },
    { label: "Inactive", value: data.inactive },
    { label: "Total stock", value: data.totalStock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user.name.split(" ")[0]}.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="card p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">
            Recently added
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline"
          >
            View all
          </Link>
        </div>

        {data.recent.length === 0 ? (
          <div className="card px-6 py-10 text-center">
            <p className="font-medium">No products yet.</p>
            <Link href="/products/new" className="btn btn-primary mt-4">
              Create first product
            </Link>
          </div>
        ) : (
          <ul className="card divide-y divide-gray-100">
            {data.recent.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 sm:p-4"
                >
                  <ProductImage
                    src={p.imageUrl}
                    alt={p.name}
                    className="size-10 shrink-0 rounded-md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      {p.category.name} · {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="hidden text-right text-sm sm:block">
                    <p className="font-medium tabular-nums">
                      {formatPrice(p.priceCents)}
                    </p>
                    <p className="text-gray-500">{p.stock} in stock</p>
                  </div>
                  <StatusBadge status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
