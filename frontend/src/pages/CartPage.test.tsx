import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import CartPage from "./CartPage";
import { checkoutCart } from "../api/orderApi";
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

vi.mock("../api/orderApi", () => ({
  checkoutCart: vi.fn(),
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
    vi.mocked(checkoutCart).mockResolvedValue({
      id: "order-1",
      subtotal: 24.99,
      totalQuantity: 1,
      items: [
        {
          id: "order-item-1",
          productId: "product-1",
          productTitle: "Desk lamp",
          unitPrice: 24.99,
          quantity: 1,
          lineTotal: 24.99,
          createdAt: "2026-06-23T00:00:00.000Z",
        },
      ],
      createdAt: "2026-06-23T00:00:00.000Z",
      updatedAt: "2026-06-23T00:00:00.000Z",
    });
  });

  it("renders the empty cart state", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<CartPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue shopping" })).toBeInTheDocument();
  });

  it("redirects to history after checkout succeeds", async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();

    cartQueryState = {
      data: {
        id: "cart-1",
        items: [
          {
            id: "cart-item-1",
            product: {
              id: "product-1",
              title: "Desk lamp",
              unitPrice: 24.99,
              image: null,
              availableQuantity: 5,
            },
            quantity: 1,
            lineTotal: 24.99,
          },
        ],
        totalQuantity: 1,
        subtotal: 24.99,
        updatedAt: "2026-06-23T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
    };

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/cart"]}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/history" element={<p>History page</p>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    await user.click(screen.getByRole("button", { name: "Checkout" }));

    expect(await screen.findByText("History page")).toBeInTheDocument();
    expect(checkoutCart).toHaveBeenCalledOnce();
  });
});
