import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BrowseProductsPage from "./BrowseProductsPage";
import type { Product } from "../types/product";

let queryState: {
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
  } | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: false,
  isFetching: false,
  error: null,
};

vi.mock("../hooks/useProductQueries", () => ({
  useProductsQuery: () => queryState,
}));

describe("BrowseProductsPage", () => {
  beforeEach(() => {
    queryState = {
      data: {
        count: 14,
        next: "http://localhost:8000/api/products/?page=2",
        previous: null,
        results: [
          {
            id: "product-1",
            seller: { id: 1, email: "seller@example.com" },
            title: "Desk lamp",
            description: "Warm light",
            unitPrice: 24.99,
            quantity: 5,
            image: null,
            createdAt: "2026-06-23T00:00:00.000Z",
            updatedAt: "2026-06-23T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      error: null,
    };
  });

  it("renders products and updates search params through filters", () => {
    render(
      <MemoryRouter initialEntries={["/products?page=1"]}>
        <Routes>
          <Route path="/products" element={<BrowseProductsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Desk lamp")).toBeInTheDocument();
    expect(screen.getByText("14 products found")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Desk lamp"), {
      target: { value: "lamp" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "price-desc" },
    });

    expect(screen.getByDisplayValue("lamp")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Price: high to low")).toBeInTheDocument();
  });

  it("shows loading and empty states", () => {
    queryState = {
      data: null,
      isLoading: true,
      isFetching: false,
      error: null,
    };

    const { rerender } = render(
      <MemoryRouter initialEntries={["/products?page=1"]}>
        <Routes>
          <Route path="/products" element={<BrowseProductsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Browse products")).toBeInTheDocument();
    expect(screen.queryByText("No products match these filters")).not.toBeInTheDocument();

    queryState = {
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isFetching: false,
      error: null,
    };

    rerender(
      <MemoryRouter initialEntries={["/products?page=1"]}>
        <Routes>
          <Route path="/products" element={<BrowseProductsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("No products match these filters")).toBeInTheDocument();
  });
});
