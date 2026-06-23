import { describe, expect, it } from "vitest";
import {
  MAX_PRODUCT_DESCRIPTION_LENGTH,
  MAX_PRODUCT_PRICE,
  MAX_PRODUCT_QUANTITY,
  MAX_PRODUCT_TITLE_LENGTH,
  productSchema,
} from "./schema";

describe("productSchema", () => {
  it("accepts valid product values", () => {
    const result = productSchema.safeParse({
      title: "Desk lamp",
      description: "Warm light",
      unitPrice: 24.99,
      quantity: 5,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid product values", () => {
    const result = productSchema.safeParse({
      title: "",
      description: "Warm light",
      unitPrice: 0,
      quantity: -1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toBe("Title is required");
      expect(result.error.flatten().fieldErrors.unitPrice?.[0]).toBe("Must be greater than 0");
      expect(result.error.flatten().fieldErrors.quantity?.[0]).toBe(
        "Must be greater than or equal to 0"
      );
    }
  });

  it("rejects prices above the maximum allowed amount", () => {
    const result = productSchema.safeParse({
      title: "Desk lamp",
      description: "Warm light",
      unitPrice: MAX_PRODUCT_PRICE + 0.01,
      quantity: 5,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.unitPrice?.[0]).toBe(
        "Price must be 10,000,000 THB or less."
      );
    }
  });

  it("rejects titles, descriptions, and quantities above the new limits", () => {
    const result = productSchema.safeParse({
      title: "x".repeat(MAX_PRODUCT_TITLE_LENGTH + 1),
      description: "x".repeat(MAX_PRODUCT_DESCRIPTION_LENGTH + 1),
      unitPrice: 1,
      quantity: MAX_PRODUCT_QUANTITY + 1,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title?.[0]).toBe(
        `Title must be ${MAX_PRODUCT_TITLE_LENGTH} characters or fewer.`
      );
      expect(result.error.flatten().fieldErrors.description?.[0]).toBe(
        `Description must be ${MAX_PRODUCT_DESCRIPTION_LENGTH} characters or fewer.`
      );
      expect(result.error.flatten().fieldErrors.quantity?.[0]).toBe(
        "Quantity must be 999,999 or less."
      );
    }
  });
});
