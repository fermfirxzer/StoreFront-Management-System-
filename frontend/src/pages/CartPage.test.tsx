import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "./CartPage";
import { useCartStore } from "../stores/cartStore";
import type { Cart } from "../types/cart";

let cartQueryState: {
  data: Cart | null;
  isLoading: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: false,
  error: null,
};

vi.mock("../hooks/useCartQueries", () => ({
  useCartQuery: () => cartQueryState,
}));

vi.mock("../api/cartApi", () => ({
  updateCartItemQuantity: vi.fn(),
  removeCartItem: vi.fn(),
}));

describe("CartPage", () => {
  beforeEach(() => {
    useCartStore.setState({ cart: null, itemCount: 0 });
    cartQueryState = {
      data: {
        id: "cart-1",
        items: [],
        totalQuantity: 0,
        subtotal: 0,
        updatedAt: "2026-06-23T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
    };
  });

  it("renders the empty cart state", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toBeInTheDocument();
  });
});
