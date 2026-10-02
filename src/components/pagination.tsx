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

export function Pagination({ query, page, pageCount, total }: Props) {
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const hasPrevious = page > 1;
  const hasNext = page < pageCount;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-gray-600">
        Showing {from}–{to} of {total}
      </p>

      <div className="flex items-center gap-3">
        {hasPrevious ? (
          <Link
            href={productsHref(query, { page: page - 1 })}
            className="btn btn-secondary"
          >
            Previous
          </Link>
        ) : (
          <span className="btn btn-secondary opacity-50">Previous</span>
        )}

        <span className="text-sm text-gray-600">
          Page {page} of {pageCount}
        </span>

        {hasNext ? (
          <Link
            href={productsHref(query, { page: page + 1 })}
            className="btn btn-secondary"
          >
            Next
          </Link>
        ) : (
          <span className="btn btn-secondary opacity-50">Next</span>
        )}
      </div>
    </nav>
  );
}
