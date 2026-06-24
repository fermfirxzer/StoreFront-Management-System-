import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Layout from "./Layout";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";

const mockLogoutRequest = vi.fn();

vi.mock("../../api/auth", () => ({
  logoutRequest: () => mockLogoutRequest(),
}));

function renderWithProviders(route: string, children: ReactNode) {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Layout>{children}</Layout>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Layout", () => {
  beforeEach(() => {
    mockLogoutRequest.mockReset();
    useAuthStore.setState({
      accessToken: null,
      user: null,
      role: null,
      isBootstrapping: false,
    });
    useCartStore.setState({ itemCount: 0 });
  });

  it("renders the logged-out shell", () => {
    renderWithProviders("/login", <div>Login content</div>);

    expect(screen.getAllByText("StoreFront Management System").length).toBeGreaterThan(0);
    expect(screen.getByText("Login content")).toBeInTheDocument();
    expect(screen.getByText("For Buyers")).toBeInTheDocument();
    expect(screen.getByText("For Sellers")).toBeInTheDocument();
  });

  it("renders the buyer shell with cart state", () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 2, email: "buyer@example.com", role: "BUYER" },
      role: "BUYER",
      isBootstrapping: false,
    });
    useCartStore.setState({ cart: null, itemCount: 3 });

    renderWithProviders("/cart", <div>Cart content</div>);

    expect(screen.getAllByLabelText("Cart, 3 items").length).toBeGreaterThan(0);
    expect(screen.getByText("Cart content")).toBeInTheDocument();
  });

  it("supports signing out from the user menu", async () => {
    useAuthStore.setState({
      accessToken: "access-1",
      user: { id: 1, email: "seller@example.com", role: "SELLER" },
      role: "SELLER",
      isBootstrapping: false,
    });

    renderWithProviders("/seller/dashboard", <div>Dashboard content</div>);

    fireEvent.click(screen.getByRole("button", { name: /seller@example.com/i }));
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" })[0]);

    await waitFor(() => {
      expect(mockLogoutRequest).toHaveBeenCalled();
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
  });
});
