import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { parseProductQuery } from "@/lib/product-query";
import { productSchema } from "@/lib/validation";
import { ForbiddenError, InvalidInputError, NotFoundError } from "@/server/errors";
import {
  createProduct,
  deleteProduct,
  getDashboardData,
  getProduct,
  listProducts,
  setProductStatus,
  updateProduct,
  type Actor,
} from "@/server/products";

let admin: Actor;
let manager: Actor;
let food: number;
let drink: number;

function input(overrides: Record<string, string> = {}) {
  return productSchema.parse({
    name: "Test Pizza",
    description: "A pizza used in tests",
    price: "9.99",
    stock: "5",
    categoryId: String(food),
    status: "ACTIVE",
    ...overrides,
  });
}

beforeAll(async () => {
  const [a, m] = await Promise.all([
    db.user.create({ data: { email: "a@test.local", name: "Admin", role: "ADMIN", passwordHash: "x" } }),
    db.user.create({ data: { email: "m@test.local", name: "Manager", role: "MANAGER", passwordHash: "x" } }),
  ]);
  admin = { id: a.id, role: a.role };
  manager = { id: m.id, role: m.role };

  food = (await db.category.create({ data: { name: "Food", slug: "food" } })).id;
  drink = (await db.category.create({ data: { name: "Drink", slug: "drink" } })).id;
});

beforeEach(async () => {
  await db.product.deleteMany();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("createProduct", () => {
  it("stores the product with the price in cents", async () => {
    const created = await createProduct(manager, input({ price: "12.30" }));
    const stored = await getProduct(created.id);

    expect(stored).toMatchObject({
      name: "Test Pizza",
      priceCents: 1230,
      stock: 5,
      status: "ACTIVE",
      createdById: manager.id,
      category: { slug: "food" },
    });
  });

  it("rejects a category that does not exist", async () => {
    await expect(createProduct(admin, input({ categoryId: "9999" }))).rejects.toBeInstanceOf(InvalidInputError);
    expect(await db.product.count()).toBe(0);
  });
});

describe("updateProduct", () => {
  it("updates an existing product", async () => {
    const { id } = await createProduct(admin, input());
    await updateProduct(manager, id, input({ name: "Renamed", stock: "0", categoryId: String(drink) }));

    const stored = await getProduct(id);
    expect(stored?.name).toBe("Renamed");
    expect(stored?.stock).toBe(0);
    expect(stored?.category.slug).toBe("drink");
  });

  it("throws NotFoundError for an unknown id", async () => {
    await expect(updateProduct(admin, "missing", input())).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("setProductStatus", () => {
  it("persists the new status", async () => {
    const { id } = await createProduct(admin, input());
    await setProductStatus(manager, id, "INACTIVE");
    expect((await getProduct(id))?.status).toBe("INACTIVE");
  });
});

describe("deleteProduct", () => {
  it("does not let a manager delete, even when called directly", async () => {
    const { id } = await createProduct(admin, input());
    await expect(deleteProduct(manager, id)).rejects.toBeInstanceOf(ForbiddenError);
    expect(await getProduct(id)).not.toBeNull();
  });

  it("lets an admin delete", async () => {
    const { id } = await createProduct(admin, input());
    await deleteProduct(admin, id);
    expect(await getProduct(id)).toBeNull();
  });

  it("throws NotFoundError when the product is already gone", async () => {
    await expect(deleteProduct(admin, "missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("listProducts", () => {
  beforeEach(async () => {
    const rows = [
      { name: "Margherita Pizza", price: "12", stock: "20", categoryId: food, status: "ACTIVE" },
      { name: "Pepperoni Pizza", price: "14", stock: "3", categoryId: food, status: "ACTIVE" },
      { name: "Four Cheese Pizza", price: "15", stock: "0", categoryId: food, status: "INACTIVE" },
      { name: "Pizza Soda", price: "3", stock: "40", categoryId: drink, status: "ACTIVE" },
      { name: "Burger", price: "10", stock: "8", categoryId: food, status: "ACTIVE" },
    ];
    for (const r of rows) {
      await createProduct(admin, input({ ...r, categoryId: String(r.categoryId) }));
    }
  });

  it("combines search, status and category filters", async () => {
    const result = await listProducts(
      parseProductQuery({ search: "PIZZA", status: "active", category: "food", sort: "name", order: "asc" }),
    );
    expect(result.items.map((p) => p.name)).toEqual(["Margherita Pizza", "Pepperoni Pizza"]);
    expect(result.total).toBe(2);
  });

  it("sorts by price in both directions", async () => {
    const asc = await listProducts(parseProductQuery({ sort: "price", order: "asc" }));
    const desc = await listProducts(parseProductQuery({ sort: "price", order: "desc" }));
    expect(asc.items[0].name).toBe("Pizza Soda");
    expect(desc.items[0].name).toBe("Four Cheese Pizza");
  });

  it("paginates and clamps a page that is out of range", async () => {
    for (let i = 0; i < 6; i++) await createProduct(admin, input({ name: `Extra ${i}` }));

    const page2 = await listProducts(parseProductQuery({ page: "2" }));
    expect(page2.total).toBe(11);
    expect(page2.pageCount).toBe(2);
    expect(page2.items).toHaveLength(3);

    const tooFar = await listProducts(parseProductQuery({ page: "50" }));
    expect(tooFar.page).toBe(2);
    expect(tooFar.items).toHaveLength(3);
  });
});

describe("getDashboardData", () => {
  it("returns counts and stock from the database", async () => {
    await createProduct(admin, input({ stock: "4" }));
    await createProduct(admin, input({ stock: "6", status: "INACTIVE" }));

    const data = await getDashboardData();
    expect(data).toMatchObject({ total: 2, active: 1, inactive: 1, totalStock: 10 });
    expect(data.recent).toHaveLength(2);
  });
});
