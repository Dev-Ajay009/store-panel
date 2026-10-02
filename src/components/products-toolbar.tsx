"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { productsHref, type ProductQuery } from "@/lib/product-query";

type Props = {
  query: ProductQuery;
  categories: { slug: string; name: string }[];
};

const sortOptions = [
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
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [search, setSearch] = useState(query.search);
  const [sentSearch, setSentSearch] = useState(query.search);
  const [urlSearch, setUrlSearch] = useState(query.search);

  if (query.search !== urlSearch) {
    setUrlSearch(query.search);
    if (query.search !== sentSearch) {
      setSearch(query.search);
      setSentSearch(query.search);
    }
  }

  function updateFilters(changes: Partial<ProductQuery>, replace = false) {
    const href = productsHref(query, { ...changes, page: 1 });
    if (replace) router.replace(href);
    else router.push(href);
  }

  function sendSearch(value: string) {
    clearTimeout(timer.current);
    setSentSearch(value);
    updateFilters({ search: value }, true);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => sendSearch(value.trim()), 400);
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sendSearch(search.trim());
  }

  function handleSortChange(value: string) {
    const [sort, order] = value.split("-");
    updateFilters({
      sort: sort as ProductQuery["sort"],
      order: order as ProductQuery["order"],
    });
  }

  return (
    <div className="card grid grid-cols-2 gap-3 p-3 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-end">
      <form
        role="search"
        onSubmit={handleSearch}
        className="col-span-2 lg:col-span-1"
      >
        <label htmlFor="search" className="label">
          Search
        </label>
        <input
          id="search"
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
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
          onChange={(e) =>
            updateFilters({ status: e.target.value as ProductQuery["status"] })
          }
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
          onChange={(e) => updateFilters({ category: e.target.value })}
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
          onChange={(e) => handleSortChange(e.target.value)}
          className="input"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <Link href="/products" className="btn btn-secondary self-end">
        Reset
      </Link>
    </div>
  );
}
