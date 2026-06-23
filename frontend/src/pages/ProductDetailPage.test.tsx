import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetailPage from "./ProductDetailPage";
import type { Product } from "../types/product";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

let detailState: {
  data: Product | null;
  isLoading: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: false,
  error: null,
};

vi.mock("../hooks/useProductQueries", () => ({
  useProductDetailQuery: () => detailState,
}));

describe("ProductDetailPage", () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 2, email: "buyer@example.com", role: "BUYER" },
      role: "BUYER",
      isBootstrapping: false,
    } as never);
    useCartStore.setState({ cart: null, itemCount: 0 });
    detailState = {
      data: {
        id: "product-1",
        seller: { id: 1, email: "seller@example.com" },
        title: "Desk lamp",
        description: "Warm light for reading",
        unitPrice: 24.99,
        quantity: 5,
        image: null,
        createdAt: "2026-06-23T00:00:00.000Z",
        updatedAt: "2026-06-23T00:00:00.000Z",
      },
      isLoading: false,
      error: null,
    };
  });

  it("renders product details and back link", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/products/product-1?page=2&search=lamp"]}>
          <Routes>
            <Route path="/products/:productId" element={<ProductDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Desk lamp")).toBeInTheDocument();
    expect(screen.getByText("Warm light for reading")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /back to products|back to catalog/i })).not.toHaveLength(0);
  });
});
