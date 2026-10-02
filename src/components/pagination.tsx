import Link from "next/link";
import {
  PAGE_SIZE,
  productsHref,
  type ProductQuery,
} from "@/lib/product-query";

type Props = {
  query: ProductQuery;
  page: number;
  pageCount: number;
  total: number;
};

function visiblePages(page: number, pageCount: number) {
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ query, page, pageCount, total }: Props) {
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const linkClass = "btn btn-secondary min-w-9 px-2.5 py-1.5";
  const disabledClass =
    "btn btn-secondary min-w-9 px-2.5 py-1.5 pointer-events-none opacity-50";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{from}</span>–
        <span className="font-medium">{to}</span> of{" "}
        <span className="font-medium">{total}</span>
      </p>

      {pageCount > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            {page > 1 ? (
              <Link
                href={productsHref(query, { page: page - 1 })}
                className={linkClass}
              >
                Previous
              </Link>
            ) : (
              <span aria-disabled="true" className={disabledClass}>
                Previous
              </span>
            )}
          </li>
          {visiblePages(page, pageCount).map((p) => (
            <li key={p} className="hidden sm:block">
              <Link
                href={productsHref(query, { page: p })}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={
                  p === page
                    ? "btn btn-primary min-w-9 px-2.5 py-1.5"
                    : linkClass
                }
              >
                {p}
              </Link>
            </li>
          ))}
          <li className="px-2 text-sm text-gray-600 sm:hidden">
            {page} / {pageCount}
          </li>
          <li>
            {page < pageCount ? (
              <Link
                href={productsHref(query, { page: page + 1 })}
                className={linkClass}
              >
                Next
              </Link>
            ) : (
              <span aria-disabled="true" className={disabledClass}>
                Next
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
