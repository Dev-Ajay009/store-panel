import "server-only";
import { Prisma, type ProductStatus, type Role } from "@prisma/client";
import { db } from "@/lib/db";
import { toCents } from "@/lib/format";
import { can, type Action } from "@/lib/permissions";
import { PAGE_SIZE, type ProductQuery } from "@/lib/product-query";
import type { ProductInput } from "@/lib/validation";
import { ForbiddenError, InvalidInputError, NotFoundError } from "./errors";

export type Actor = { id: string; role: Role };

const withCategory = { category: { select: { id: true, name: true, slug: true } } } as const;

export type ProductWithCategory = Prisma.ProductGetPayload<{ include: typeof withCategory }>;

function authorize(actor: Actor, action: Action) {
  if (!can(actor.role, action)) throw new ForbiddenError();
}

function isRecordNotFound(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

async function assertCategoryExists(categoryId: number) {
  const category = await db.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new InvalidInputError({ categoryId: ["Choose a valid category"] });
}

function toData(input: ProductInput) {
  return {
    name: input.name,
    description: input.description,
    priceCents: toCents(input.price),
    stock: input.stock,
    imageUrl: input.imageUrl,
    status: input.status,
    categoryId: input.categoryId,
  };
}

export async function listProducts(query: ProductQuery) {
  const where: Prisma.ProductWhereInput = {};
  if (query.search) where.name = { contains: query.search };
  if (query.status !== "all") where.status = query.status === "active" ? "ACTIVE" : "INACTIVE";
  if (query.category) where.category = { slug: query.category };

  const sortColumn = query.sort === "price" ? "priceCents" : query.sort;

  const total = await db.product.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);

  const items = await db.product.findMany({
    where,
    include: withCategory,
    orderBy: [{ [sortColumn]: query.order }, { id: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return { items, total, page, pageCount };
}

export function getProduct(id: string) {
  return db.product.findUnique({ where: { id }, include: withCategory });
}

export function listCategories() {
  return db.category.findMany({ orderBy: { id: "asc" } });
}

export async function getDashboardData() {
  const [total, active, stock, recent] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.product.aggregate({ _sum: { stock: true } }),
    db.product.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: withCategory }),
  ]);

  return {
    total,
    active,
    inactive: total - active,
    totalStock: stock._sum.stock ?? 0,
    recent,
  };
}

export async function createProduct(actor: Actor, input: ProductInput) {
  authorize(actor, "product:create");
  await assertCategoryExists(input.categoryId);

  return db.product.create({
    data: { ...toData(input), createdById: actor.id },
  });
}

export async function updateProduct(actor: Actor, id: string, input: ProductInput) {
  authorize(actor, "product:edit");
  await assertCategoryExists(input.categoryId);

  try {
    return await db.product.update({ where: { id }, data: toData(input) });
  } catch (err) {
    if (isRecordNotFound(err)) throw new NotFoundError("Product not found");
    throw err;
  }
}

export async function setProductStatus(actor: Actor, id: string, status: ProductStatus) {
  authorize(actor, "product:status");

  try {
    return await db.product.update({ where: { id }, data: { status } });
  } catch (err) {
    if (isRecordNotFound(err)) throw new NotFoundError("Product not found");
    throw err;
  }
}

export async function deleteProduct(actor: Actor, id: string) {
  authorize(actor, "product:delete");

  try {
    await db.product.delete({ where: { id } });
  } catch (err) {
    if (isRecordNotFound(err)) throw new NotFoundError("Product not found");
    throw err;
  }
}
