"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { hasActiveFilters, productsHref, type ProductQuery, type SortField, type SortOrder } from "@/lib/product-query";

type Props = {
  query: ProductQuery;
  categories: { slug: string; name: string }[];
};

const sortOptions: { value: `${SortField}-${SortOrder}`; label: string }[] = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "createdAt-asc", label: "Oldest first" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "price-asc", label: "Price (low to high)" },
  { value: "price-desc", label: "Price (high to low)" },
  { value: "stock-asc", label: "Stock (low to high)" },
  { value: "stock-desc", label: "Stock (high to low)" },
];

export function ProductsToolbar({ query, categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [search, setSearch] = useState(query.search);
  const [lastPushed, setLastPushed] = useState(query.search);
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);

  // Keep the input in sync when the URL changes from outside (back button,
  // "clear filters" link), but not when the change is our own debounced update
  // arriving while the user is still typing.
  if (query.search !== prevQuerySearch) {
    setPrevQuerySearch(query.search);
    if (query.search !== lastPushed) setSearch(query.search);
  }

  function navigate(changes: Partial<ProductQuery>, replace = false) {
    const href = productsHref(query, { ...changes, page: 1 });
    if (replace) router.replace(href, { scroll: false });
    else router.push(href, { scroll: false });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLastPushed(value.trim());
      navigate({ search: value.trim() }, true);
    }, 350);
  }

  function clearAll() {
    clearTimeout(timer.current);
    setSearch("");
    setLastPushed("");
    router.push(pathname);
  }

  return (
    <div className="card grid grid-cols-2 gap-3 p-3 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-end">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="col-span-2 lg:col-span-1">
        <label htmlFor="search" className="label">
          Search
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input"
        />
      </form>

      <div>
        <label htmlFor="status-filter" className="label">
          Status
        </label>
        <select
          id="status-filter"
          value={query.status}
          onChange={(e) => navigate({ status: e.target.value as ProductQuery["status"] })}
          className="input"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label htmlFor="category-filter" className="label">
          Category
        </label>
        <select
          id="category-filter"
          value={query.category}
          onChange={(e) => navigate({ category: e.target.value })}
          className="input"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort" className="label">
          Sort by
        </label>
        <select
          id="sort"
          value={`${query.sort}-${query.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split("-") as [SortField, SortOrder];
            navigate({ sort, order });
          }}
          className="input"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={clearAll}
        disabled={!hasActiveFilters(query) && search === ""}
        className="btn btn-secondary self-end"
      >
        Reset
      </button>
    </div>
  );
}
