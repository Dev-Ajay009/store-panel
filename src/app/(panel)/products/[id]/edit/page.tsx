import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { can } from "@/lib/permissions";
import { requireUser } from "@/server/auth";
import { getProduct, listCategories } from "@/server/products";
import { updateProductAction } from "../../actions";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, product, categories] = await Promise.all([requireUser(), getProduct(id), listCategories()]);

  if (!product) notFound();
  if (!can(user.role, "product:edit")) redirect(`/products/${id}`);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Edit product</h1>
      <ProductForm
        action={updateProductAction.bind(null, product.id)}
        categories={categories}
        submitLabel="Save changes"
        cancelHref={`/products/${product.id}`}
        initialValues={{
          name: product.name,
          description: product.description,
          price: (product.priceCents / 100).toFixed(2),
          stock: String(product.stock),
          categoryId: String(product.categoryId),
          imageUrl: product.imageUrl ?? "",
          status: product.status,
        }}
      />
    </div>
  );
}
