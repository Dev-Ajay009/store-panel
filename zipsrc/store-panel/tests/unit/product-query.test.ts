import { describe, expect, it } from "vitest";
import { parseProductQuery, productsHref } from "@/lib/product-query";

describe("parseProductQuery", () => {
  it("falls back to defaults", () => {
    expect(parseProductQuery({})).toEqual({
      search: "",
      status: "all",
      category: "",
      sort: "createdAt",
      order: "desc",
      page: 1,
    });
  });

  it("reads valid values from the URL", () => {
    expect(
      parseProductQuery({ search: " pizza ", status: "active", category: "food", sort: "price", order: "asc", page: "2" }),
    ).toEqual({ search: "pizza", status: "active", category: "food", sort: "price", order: "asc", page: 2 });
  });

  it("ignores invalid values instead of failing", () => {
    const q = parseProductQuery({ status: "deleted", sort: "password", order: "sideways", page: "-3" });
    expect(q.status).toBe("all");
    expect(q.sort).toBe("createdAt");
    expect(q.order).toBe("desc");
    expect(q.page).toBe(1);
    expect(parseProductQuery({ page: "abc" }).page).toBe(1);
  });

  it("uses the first value when a param is repeated", () => {
    expect(parseProductQuery({ status: ["inactive", "active"] }).status).toBe("inactive");
  });
});

describe("productsHref", () => {
  const base = parseProductQuery({});

  it("leaves defaults out of the URL", () => {
    expect(productsHref(base)).toBe("/products");
  });

  it("keeps search, filters and sorting when changing page", () => {
    const q = parseProductQuery({ search: "pizza", status: "active", category: "food", sort: "name", order: "asc" });
    expect(productsHref(q, { page: 2 })).toBe(
      "/products?search=pizza&status=active&category=food&sort=name&order=asc&page=2",
    );
  });
});
