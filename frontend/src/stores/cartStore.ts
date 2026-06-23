import { create } from "zustand";

interface CartState {
  itemCount: number;
  setItemCount: (count: number) => void;
  incrementItemCount: (amount?: number) => void;
  decrementItemCount: (amount?: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
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
  clearCart: () => set({ itemCount: 0 }),
}));

