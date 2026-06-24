import { beforeEach, describe, expect, it, vi } from "vitest";

describe("order api", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps checkout, buyer order list, and seller sales responses", async () => {
    const post = vi.fn().mockResolvedValue({
      data: {
        data: {
          id: "order-1",
          subtotal: "49.98",
          total_quantity: 2,
          items: [
            {
              id: "order-item-1",
              product: "product-1",
              product_title: "Desk lamp",
              unit_price: "24.99",
              quantity: 2,
              line_total: "49.98",
              created_at: "2026-06-23T00:00:00.000Z",
            },
          ],
          created_at: "2026-06-23T00:00:00.000Z",
          updated_at: "2026-06-23T00:00:00.000Z",
        },
      },
    });
    const get = vi.fn((url: string) => {
      if (url === "/orders/sales/") {
        return Promise.resolve({
          data: {
            data: [
              {
                id: "sale-1",
                order_id: "order-1",
                product_id: "product-1",
                product_title: "Desk lamp",
                unit_price: "24.99",
                quantity: 2,
                line_total: "49.98",
                sold_at: "2026-06-23T00:00:00.000Z",
                buyer: {
                  id: 2,
                  email: "buyer@example.com",
                },
              },
            ],
          },
        });
      }

      return Promise.resolve({
        data: {
          data: [
            {
              id: "order-1",
              subtotal: "49.98",
              total_quantity: 2,
              items: [],
              created_at: "2026-06-23T00:00:00.000Z",
              updated_at: "2026-06-23T00:00:00.000Z",
            },
          ],
        },
      });
    });

    vi.doMock("./client", () => ({
      apiClient: { post, get },
    }));

    const api = await import("./orderApi");

    const checkedOut = await api.checkoutCart();
    expect(post).toHaveBeenCalledWith("/orders/checkout/");
    expect(checkedOut.subtotal).toBe(49.98);
    expect(checkedOut.items[0].productTitle).toBe("Desk lamp");

    const orders = await api.getOrders();
    expect(get).toHaveBeenCalledWith("/orders/");
    expect(orders[0].totalQuantity).toBe(2);

    const sales = await api.getSellerSales();
    expect(get).toHaveBeenCalledWith("/orders/sales/");
    expect(sales[0].buyer.email).toBe("buyer@example.com");
  });
});
