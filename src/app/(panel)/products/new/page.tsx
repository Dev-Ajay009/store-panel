import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { can } from "@/lib/permissions";
import { requireUser } from "@/server/auth";
import { listCategories } from "@/server/products";
import { createProductAction } from "../actions";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [user, categories] = await Promise.all([requireUser(), listCategories()]);
  if (!can(user.role, "product:create")) redirect("/products");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">New product</h1>
      <ProductForm
        action={createProductAction}
        categories={categories}
        submitLabel="Create product"
        cancelHref="/products"
      />
    </div>
  );
}
