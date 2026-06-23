import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetailPage from "./ProductDetailPage";
import type { Product } from "../types/product";

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
    render(
      <MemoryRouter initialEntries={["/products/product-1?page=2&search=lamp"]}>
        <Routes>
          <Route path="/products/:productId" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Desk lamp")).toBeInTheDocument();
    expect(screen.getByText("Warm light for reading")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /back to products|back to catalog/i })).not.toHaveLength(0);
  });
});
