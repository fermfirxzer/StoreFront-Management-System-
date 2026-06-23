import { beforeEach, describe, expect, it, vi } from "vitest";

describe("cart api", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps cart responses and sends cart mutations", async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "cart-1",
          items: [
            {
              id: "item-1",
              product: {
                id: "product-1",
                title: "Desk lamp",
                unit_price: "24.99",
                image: null,
                quantity: 5,
              },
              quantity: 2,
              line_total: "49.98",
            },
          ],
          total_quantity: 2,
          subtotal: "49.98",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "cart-1",
          items: [],
          total_quantity: 1,
          subtotal: "24.99",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });
    const patch = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "cart-1",
          items: [],
          total_quantity: 3,
          subtotal: "74.97",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });
    const del = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "cart-1",
          items: [],
          total_quantity: 0,
          subtotal: "0.00",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });

    vi.doMock("./client", () => ({
      apiClient: { get, post, patch, delete: del },
    }));

    const api = await import("./cartApi");

    const cart = await api.getCart();
    expect(cart.totalQuantity).toBe(2);
    expect(cart.items[0].product.unitPrice).toBe(24.99);

    await api.addCartItem({ productId: "product-1", quantity: 1 });
    expect(post).toHaveBeenCalledWith("/cart/items/", {
      product_id: "product-1",
      quantity: 1,
    });

    await api.updateCartItemQuantity("item-1", { quantity: 3 });
    expect(patch).toHaveBeenCalledWith("/cart/items/item-1/", { quantity: 3 });

    await api.removeCartItem("item-1");
    expect(del).toHaveBeenCalledWith("/cart/items/item-1/");
  });
});
