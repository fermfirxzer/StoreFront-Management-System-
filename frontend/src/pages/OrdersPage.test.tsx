import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "./OrdersPage";
import type { Order } from "../types/order";

let ordersQueryState: {
  data: Order[] | null;
  isLoading: boolean;
  error: Error | null;
} = {
  data: null,
  isLoading: false,
  error: null,
};

vi.mock("../hooks/useOrderQueries", () => ({
  useOrdersQuery: () => ordersQueryState,
}));

describe("OrdersPage", () => {
  beforeEach(() => {
    ordersQueryState = {
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
});
