import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "./OrdersPage";
import type { Order } from "../types/order";
import type { SellerSale } from "../types/order";

let ordersQueryState: {
  data: Order[] | null;
  isLoading: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: false,
  error: null,
};

let sellerSalesQueryState: {
  data: SellerSale[] | null;
  isLoading: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: false,
  error: null,
};

let currentRole: "BUYER" | "SELLER" = "BUYER";

vi.mock("../hooks/useOrderQueries", () => ({
  useOrdersQuery: () => ordersQueryState,
  useSellerSalesQuery: () => sellerSalesQueryState,
}));

vi.mock("../stores/authStore", () => ({
  useAuthStore: (selector: (state: { role: "BUYER" | "SELLER" }) => unknown) =>
    selector({ role: currentRole }),
}));

describe("OrdersPage", () => {
  beforeEach(() => {
    currentRole = "BUYER";
    ordersQueryState = {
      data: [],
      isLoading: false,
      error: null,
    };
    sellerSalesQueryState = {
      data: [],
      isLoading: false,
      error: null,
    };
  });

  it("renders empty orders state", () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });

  it("renders seller sales history", () => {
    currentRole = "SELLER";
    sellerSalesQueryState = {
      data: [
        {
          id: "sale-1",
          orderId: "order-1",
          productId: "product-1",
          productTitle: "Desk lamp",
          unitPrice: 24.99,
          quantity: 2,
          lineTotal: 49.98,
          soldAt: "2026-06-23T00:00:00.000Z",
          buyer: {
            id: 2,
            email: "buyer@example.com",
          },
        },
      ],
      isLoading: false,
      error: null,
    };

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrdersPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Sales history")).toBeInTheDocument();
    expect(screen.getByText("Desk lamp")).toBeInTheDocument();
    expect(screen.getByText("Buyer: buyer@example.com")).toBeInTheDocument();
  });
});
