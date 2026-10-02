"use server";

import type { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { productSchema, type ProductField } from "@/lib/validation";
import { requireUser } from "@/server/auth";
import {
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
} from "@/server/errors";
import {
  createProduct,
  deleteProduct,
  setProductStatus,
  updateProduct,
} from "@/server/products";

export type ProductFormState = {
  message?: string;
  fieldErrors?: Partial<Record<ProductField, string[]>>;
  values?: Partial<Record<ProductField, string>>;
  productId?: string;
};

export type ActionResult = { error?: string };

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    stock: String(formData.get("stock") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE"),
  };
}

function errorMessage(err: unknown) {
  if (err instanceof ForbiddenError) return err.message;
  if (err instanceof NotFoundError) return "This product no longer exists.";
  console.error(err);
  return "Something went wrong. Please try again.";
}

function refreshProductPages() {
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/products/[id]", "page");
}

async function saveProduct(
  formData: FormData,
  id?: string,
): Promise<ProductFormState> {
  const user = await requireUser();
  const values = readForm(formData);
  const parsed = productSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    const product = id
      ? await updateProduct(user, id, parsed.data)
      : await createProduct(user, parsed.data);
    refreshProductPages();
    return { productId: product.id };
  } catch (err) {
    if (err instanceof InvalidInputError) {
      return {
        message: "Please fix the highlighted fields.",
        fieldErrors: err.fieldErrors,
        values,
      };
    }
    return { message: errorMessage(err), values };
  }
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
) {
  return saveProduct(formData);
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
) {
  return saveProduct(formData, id);
}

export async function changeStatusAction(
  id: string,
  status: ProductStatus,
): Promise<ActionResult> {
  const user = await requireUser();
  if (status !== "ACTIVE" && status !== "INACTIVE") {
    return { error: "Invalid status." };
  }

  try {
    await setProductStatus(user, id, status);
  } catch (err) {
    return { error: errorMessage(err) };
  }

  refreshProductPages();
  return {};
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const user = await requireUser();

  try {
    await deleteProduct(user, id);
  } catch (err) {
    return { error: errorMessage(err) };
  }

  refreshProductPages();
  return {};
}
