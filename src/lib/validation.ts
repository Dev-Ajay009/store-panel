import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const numberField = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .transform(Number)
    .refine((n) => Number.isFinite(n), `${label} must be a number`);

export const productSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(120, "Name is too long"),
  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description is too long"),
  price: numberField("Price")
    .refine((n) => n > 0, "Price must be greater than 0")
    .refine((n) => n < 1_000_000, "Price is too high"),
  stock: numberField("Stock")
    .refine((n) => Number.isInteger(n), "Stock must be a whole number")
    .refine((n) => n >= 0, "Stock cannot be negative"),
  categoryId: z
    .string({ error: "Category is required" })
    .min(1, "Category is required")
    .transform(Number)
    .refine((n) => Number.isInteger(n) && n > 0, "Category is required"),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || isHttpUrl(v), "Image URL must be a valid URL"),
  status: z
    .enum(["ACTIVE", "INACTIVE"], { error: "Choose a valid status" })
    .default("ACTIVE"),
});

export type ProductInput = z.output<typeof productSchema>;
export type ProductField = keyof z.input<typeof productSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
