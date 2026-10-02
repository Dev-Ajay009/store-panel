"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ProductFormState } from "@/app/(panel)/products/actions";
import type { ProductField } from "@/lib/validation";

type Category = { id: number; name: string };

type Props = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  initialValues?: Partial<Record<ProductField, string>>;
  submitLabel: string;
  cancelHref: string;
};

export function ProductForm({ action, categories, initialValues = {}, submitLabel, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  // After a failed submit, show what the user typed rather than the original values.
  const values = state.values ?? initialValues;
  const errorFor = (field: ProductField) => state.fieldErrors?.[field]?.[0];

  function fieldProps(field: ProductField) {
    const error = errorFor(field);
    return {
      id: field,
      name: field,
      defaultValue: values[field] ?? "",
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  function fieldError(field: ProductField) {
    const error = errorFor(field);
    if (!error) return null;
    return (
      <p id={`${field}-error`} className="field-error">
        {error}
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="card space-y-5 p-5 sm:p-6">
      {state.message && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input type="text" className="input" {...fieldProps("name")} />
        {fieldError("name")}
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea rows={4} className="input" {...fieldProps("description")} />
        {fieldError("description")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="label">
            Price (USD)
          </label>
          <input type="number" inputMode="decimal" step="0.01" min="0" className="input" {...fieldProps("price")} />
          {fieldError("price")}
        </div>
        <div>
          <label htmlFor="stock" className="label">
            Stock
          </label>
          <input type="number" inputMode="numeric" step="1" min="0" className="input" {...fieldProps("stock")} />
          {fieldError("stock")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="categoryId" className="label">
            Category
          </label>
          <select className="input" {...fieldProps("categoryId")}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldError("categoryId")}
        </div>
        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select className="input" {...fieldProps("status")} defaultValue={values.status ?? "ACTIVE"}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {fieldError("status")}
        </div>
      </div>

      <div>
        <label htmlFor="imageUrl" className="label">
          Image URL <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input type="url" placeholder="https://…" className="input" {...fieldProps("imageUrl")} />
        {fieldError("imageUrl")}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="btn btn-secondary">
          Cancel
        </Link>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
