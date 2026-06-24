import { create } from "zustand";
import type { Cart, CartItem, CartProduct } from "../types/cart";

interface CartState {
  cart: Cart | null;
  itemCount: number;
  setCart: (cart: Cart | null) => void;
  setItemCount: (count: number) => void;
  incrementItemCount: (amount?: number) => void;
  decrementItemCount: (amount?: number) => void;
  optimisticAddItem: (payload: { product: CartProduct; quantity: number }) => void;
  optimisticUpdateItem: (payload: { itemId: string; quantity: number }) => void;
  optimisticRemoveItem: (itemId: string) => void;
  clearCart: () => void;
}

function computeSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.lineTotal, 0);
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  itemCount: 0,
  setCart: (cart) =>
    set({
      cart,
      itemCount: cart?.totalQuantity ?? 0,
    }),
  setItemCount: (itemCount) =>
    set({
      itemCount: Math.max(0, Math.floor(itemCount)),
    }),
  incrementItemCount: (amount = 1) =>
    set((state) => ({
      itemCount: Math.max(0, state.itemCount + Math.floor(amount)),
    })),
  decrementItemCount: (amount = 1) =>
    set((state) => ({
      itemCount: Math.max(0, state.itemCount - Math.floor(amount)),
    })),
  optimisticAddItem: ({ product, quantity }) =>
    set((state) => {
      const currentCart = state.cart ?? {
        id: "optimistic-cart",
        items: [],
        totalQuantity: 0,
        subtotal: 0,
        updatedAt: new Date().toISOString(),
      };
      const existingItem = currentCart.items.find((item) => item.product.id === product.id);
      const items = existingItem
        ? currentCart.items.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  lineTotal: product.unitPrice * (item.quantity + quantity),
                }
              : item
          )
        : [
            ...currentCart.items,
            {
              id: `optimistic-${product.id}`,
              product,
              quantity,
              lineTotal: product.unitPrice * quantity,
            },
          ];

      return {
        cart: {
          ...currentCart,
          items,
          totalQuantity: currentCart.totalQuantity + quantity,
          subtotal: computeSubtotal(items),
          updatedAt: new Date().toISOString(),
        },
        itemCount: currentCart.totalQuantity + quantity,
      };
    }),
  optimisticUpdateItem: ({ itemId, quantity }) =>
    set((state) => {
      if (!state.cart) {
        return state;
      }

      const items = state.cart.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              lineTotal: item.product.unitPrice * quantity,
            }
          : item
      );

      const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

      return {
        cart: {
          ...state.cart,
          items,
          totalQuantity,
          subtotal: computeSubtotal(items),
          updatedAt: new Date().toISOString(),
        },
        itemCount: totalQuantity,
      };
    }),
  optimisticRemoveItem: (itemId) =>
    set((state) => {
      if (!state.cart) {
        return state;
      }

      const items = state.cart.items.filter((item) => item.id !== itemId);
      const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

      return {
        cart: {
          ...state.cart,
          items,
          totalQuantity,
          subtotal: computeSubtotal(items),
          updatedAt: new Date().toISOString(),
        },
        itemCount: totalQuantity,
      };
    }),
  clearCart: () => set({ cart: null, itemCount: 0 }),
}));
