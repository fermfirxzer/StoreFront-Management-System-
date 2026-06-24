import { describe, expect, it, beforeEach } from "vitest";
import { useCartStore } from "./cartStore";

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null, itemCount: 0 });
  });

  it("clamps and floors item counts", () => {
    useCartStore.getState().setItemCount(3.9);
    expect(useCartStore.getState().itemCount).toBe(3);

    useCartStore.getState().setItemCount(-4);
    expect(useCartStore.getState().itemCount).toBe(0);
  });

  it("increments, decrements, and clears the cart", () => {
    useCartStore.getState().incrementItemCount();
    useCartStore.getState().incrementItemCount(2.8);
    useCartStore.getState().decrementItemCount(1.2);

    expect(useCartStore.getState().itemCount).toBe(2);

    useCartStore.getState().decrementItemCount(99);
    expect(useCartStore.getState().itemCount).toBe(0);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().itemCount).toBe(0);
  });

  it("supports optimistic cart updates", () => {
    useCartStore.getState().optimisticAddItem({
      product: {
        id: "product-1",
        title: "Desk lamp",
        unitPrice: 24.99,
        image: null,
        availableQuantity: 5,
      },
      quantity: 2,
    });

    expect(useCartStore.getState().itemCount).toBe(2);
    expect(useCartStore.getState().cart?.subtotal).toBe(49.98);

    const itemId = useCartStore.getState().cart?.items[0].id;
    expect(itemId).toBeDefined();

    useCartStore.getState().optimisticUpdateItem({
      itemId: itemId!,
      quantity: 3,
    });
    expect(useCartStore.getState().itemCount).toBe(3);

    useCartStore.getState().optimisticRemoveItem(itemId!);
    expect(useCartStore.getState().itemCount).toBe(0);
  });
});
