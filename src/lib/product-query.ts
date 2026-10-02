export const PAGE_SIZE = 8;

export const SORT_FIELDS = ["name", "price", "stock", "createdAt"] as const;
export const STATUS_FILTERS = ["all", "active", "inactive"] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type StatusFilter = (typeof STATUS_FILTERS)[number];
export type SortOrder = "asc" | "desc";

export type ProductQuery = {
  search: string;
  status: StatusFilter;
  category: string;
  sort: SortField;
  order: SortOrder;
  page: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;

const defaults: ProductQuery = {
  search: "",
  status: "all",
  category: "",
  sort: "createdAt",
  order: "desc",
  page: 1,
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function parseProductQuery(params: SearchParams): ProductQuery {
  const page = Number.parseInt(first(params.page) ?? "", 10);

  return {
    search: (first(params.search) ?? "").trim().slice(0, 100),
    status: oneOf(first(params.status), STATUS_FILTERS, defaults.status),
    category: first(params.category) ?? "",
    sort: oneOf(first(params.sort), SORT_FIELDS, defaults.sort),
    order: oneOf(first(params.order), ["asc", "desc"] as const, defaults.order),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function hasActiveFilters(q: ProductQuery) {
  return q.search !== "" || q.status !== "all" || q.category !== "";
}

export function productsHref(q: ProductQuery, changes: Partial<ProductQuery> = {}) {
  const next = { ...q, ...changes };
  const params = new URLSearchParams();

  if (next.search) params.set("search", next.search);
  if (next.status !== defaults.status) params.set("status", next.status);
  if (next.category) params.set("category", next.category);
  if (next.sort !== defaults.sort || next.order !== defaults.order) {
    params.set("sort", next.sort);
    params.set("order", next.order);
  }
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}
