import { describe, expect, it, vi, beforeEach } from "vitest";

describe("product api", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps seller product responses and sends multipart payloads", async () => {
    const get = vi.fn((url: string) => {
      if (url === "/products/") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "product-1",
                seller: { id: 1, email: "seller@example.com" },
                title: "Desk lamp",
                description: "Warm light",
                unit_price: "24.99",
                quantity: 5,
                image: null,
                created_at: "2026-06-23T00:00:00.000Z",
                updated_at: "2026-06-23T00:00:00.000Z",
              },
            ],
          },
        });
      }

      return Promise.resolve({
        data: {
          data: {
            id: "product-1",
            seller: { id: 1, email: "seller@example.com" },
            title: "Desk lamp",
            description: "Warm light",
            unit_price: "24.99",
            quantity: 5,
            image: null,
            created_at: "2026-06-23T00:00:00.000Z",
            updated_at: "2026-06-23T00:00:00.000Z",
          },
        },
      });
    });
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "product-2",
          seller: { id: 1, email: "seller@example.com" },
          title: "Chair",
          description: "Comfortable",
          unit_price: "79.50",
          quantity: 2,
          image: null,
          created_at: "2026-06-23T00:00:00.000Z",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });
    const patch = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "product-1",
          seller: { id: 1, email: "seller@example.com" },
          title: "Desk lamp pro",
          description: "Warmer light",
          unit_price: "29.99",
          quantity: 6,
          image: null,
          created_at: "2026-06-23T00:00:00.000Z",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });
    const del = vi.fn().mockResolvedValue(undefined);

    vi.doMock("./client", () => ({
      apiClient: { get, post, patch, delete: del },
    }));

    const api = await import("./productApi");
    const products = await api.getSellerProducts();
    expect(products[0]).toMatchObject({
      id: "product-1",
      title: "Desk lamp",
      unitPrice: 24.99,
      quantity: 5,
    });

    const single = await api.getSellerProductById("product-1");
    expect(single.unitPrice).toBe(24.99);

    const image = new File(["image"], "product.png", { type: "image/png" });
    const created = await api.createProduct({
      title: "Chair",
      description: "Comfortable",
      unitPrice: 79.5,
      quantity: 2,
      image,
    });

    expect(post).toHaveBeenCalledTimes(1);
    const postedFormData = post.mock.calls[0][1] as FormData;
    expect(postedFormData.get("title")).toBe("Chair");
    expect(postedFormData.get("unit_price")).toBe("79.5");
    expect(postedFormData.get("image")).toBe(image);
    expect(created.title).toBe("Chair");

    const updated = await api.updateProduct("product-1", {
      title: "Desk lamp pro",
      quantity: 6,
    });

    expect(patch).toHaveBeenCalledTimes(1);
    const patchedFormData = patch.mock.calls[0][1] as FormData;
    expect(patchedFormData.get("title")).toBe("Desk lamp pro");
    expect(patchedFormData.get("quantity")).toBe("6");
    expect(updated.quantity).toBe(6);

    await api.deleteProduct("product-1");
    expect(del).toHaveBeenCalledWith("/products/product-1/");
  });
});
