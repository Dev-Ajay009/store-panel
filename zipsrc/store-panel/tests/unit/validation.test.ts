import { describe, expect, it } from "vitest";
import { z } from "zod";
import { loginSchema, productSchema } from "@/lib/validation";

const valid = {
  name: "Margherita Pizza",
  description: "Tomato and mozzarella",
  price: "12.50",
  stock: "20",
  categoryId: "1",
  imageUrl: "",
  status: "ACTIVE",
};

function errorsFor(input: Record<string, string | undefined>) {
  const result = productSchema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("productSchema", () => {
  it("parses a valid product and converts numbers", () => {
    const result = productSchema.parse(valid);
    expect(result).toEqual({
      name: "Margherita Pizza",
      description: "Tomato and mozzarella",
      price: 12.5,
      stock: 20,
      categoryId: 1,
      imageUrl: null,
      status: "ACTIVE",
    });
  });

  it("requires a name of at least 3 characters", () => {
    expect(errorsFor({ ...valid, name: "" }).name?.[0]).toBe("Name is required");
    expect(errorsFor({ ...valid, name: "ab" }).name?.[0]).toBe("Name must be at least 3 characters");
    expect(errorsFor({ ...valid, name: "   ab  " }).name?.[0]).toBe("Name must be at least 3 characters");
  });

  it("requires a description", () => {
    expect(errorsFor({ ...valid, description: "  " }).description?.[0]).toBe("Description is required");
  });

  it("requires price to be greater than 0", () => {
    expect(errorsFor({ ...valid, price: "" }).price?.[0]).toBe("Price is required");
    expect(errorsFor({ ...valid, price: "0" }).price?.[0]).toBe("Price must be greater than 0");
    expect(errorsFor({ ...valid, price: "-5" }).price?.[0]).toBe("Price must be greater than 0");
    expect(errorsFor({ ...valid, price: "abc" }).price?.[0]).toBe("Price must be a number");
  });

  it("does not allow negative or fractional stock", () => {
    expect(errorsFor({ ...valid, stock: "" }).stock?.[0]).toBe("Stock is required");
    expect(errorsFor({ ...valid, stock: "-1" }).stock?.[0]).toBe("Stock cannot be negative");
    expect(errorsFor({ ...valid, stock: "2.5" }).stock?.[0]).toBe("Stock must be a whole number");
    expect(productSchema.parse({ ...valid, stock: "0" }).stock).toBe(0);
  });

  it("requires a category", () => {
    expect(errorsFor({ ...valid, categoryId: "" }).categoryId?.[0]).toBe("Category is required");
  });

  it("accepts an empty image URL but rejects invalid ones", () => {
    expect(productSchema.parse({ ...valid, imageUrl: undefined }).imageUrl).toBeNull();
    expect(errorsFor({ ...valid, imageUrl: "not-a-url" }).imageUrl?.[0]).toBe("Image URL must be a valid URL");
    expect(errorsFor({ ...valid, imageUrl: "javascript:alert(1)" }).imageUrl?.[0]).toBe(
      "Image URL must be a valid URL",
    );
    expect(productSchema.parse({ ...valid, imageUrl: "https://example.com/a.jpg" }).imageUrl).toBe(
      "https://example.com/a.jpg",
    );
  });

  it("rejects unknown statuses", () => {
    expect(errorsFor({ ...valid, status: "DELETED" }).status).toBeDefined();
  });
});

describe("loginSchema", () => {
  it("validates email and password", () => {
    expect(loginSchema.safeParse({ email: "admin@example.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "admin@example.com", password: "" }).success).toBe(false);
  });
});
