import { describe, expect, it } from "vitest";
import { productSchema } from "./schema";

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
});
