import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import SellerDashboardPage from "./SellerDashboardPage";
import { useAuthStore } from "../../stores/authStore";
import type { Product } from "../../types/product";

const mockClearSession = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockDeleteProduct = vi.fn();

type MutationConfig<TVariables, TData> = {
  mutationFn: (variables: TVariables) => Promise<TData> | TData;
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void | Promise<void>;
};

let sellerQueryResult: {
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: Product[];
  };
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
} = {
  data: {
    count: 2,
    next: null,
    previous: null,
    results: [],
  },
  isLoading: false,
  isFetching: false,
  error: null,
};

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  useMutation: <TData, TVariables>(config: MutationConfig<TVariables, TData>) => ({
    isPending: false,
    isError: false,
    reset: vi.fn(),
    mutateAsync: async (id: string) => {
      const result = await config.mutationFn(id as TVariables);
      await config.onSuccess?.(result, id as TVariables, undefined);
      return result;
    },
  }),
}));

vi.mock("../../hooks/useProductQueries", () => ({
  useSellerProductsQuery: () => sellerQueryResult,
}));

vi.mock("../../api/productApi", () => ({
  deleteProduct: (...args: unknown[]) => mockDeleteProduct(...args),
}));

describe("SellerDashboardPage", () => {
  beforeEach(() => {
    mockInvalidateQueries.mockReset();
    mockDeleteProduct.mockReset();
    mockClearSession.mockReset();
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      role: "SELLER",
      isBootstrapping: false,
      clearSession: mockClearSession,
    } as never);
    sellerQueryResult = {
      data: {
        count: 14,
        next: "http://localhost:8000/api/products/seller/?page=2",
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
          {
            id: "product-2",
            seller: { id: 1, email: "seller@example.com" },
            title: "Chair",
            description: "",
            unitPrice: 79.5,
            quantity: 0,
            image: null,
            createdAt: "2026-06-23T00:00:00.000Z",
            updatedAt: "2026-06-24T00:00:00.000Z",
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      error: null,
    };
  });

  it("renders products, supports sorting, pagination, and delete modal", async () => {
    render(
      <MemoryRouter initialEntries={["/seller/dashboard?page=1"]}>
        <Routes>
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("14 products listed")).toBeInTheDocument();
    expect(screen.getByText("Chair")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Latest update"), {
      target: { value: "price-asc" },
    });
    expect(screen.getByDisplayValue("Price: low to high")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockDeleteProduct).toHaveBeenCalledWith("product-1");
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["seller-products"] });
    });
  });
});
